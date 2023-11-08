# https://registry.terraform.io/providers/hashicorp/aws/latest/docs

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      # version = "" # optional
    }
    docker = {
      source = "kreuzwerker/docker"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = "ap-southeast-1"
}


# * VPC and subnets #################################################
resource "aws_vpc" "vpc1" {
  cidr_block = "10.0.0.0/16" # changeable
  tags = {
    Name = "vpc1"
  }
}

resource "aws_subnet" "subnet_public_1" {
  vpc_id                  = aws_vpc.vpc1.id
  cidr_block              = "10.0.0.0/18"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "subnet_public_1"
  }
}

resource "aws_subnet" "subnet_private_1" {
  vpc_id                  = aws_vpc.vpc1.id
  cidr_block              = "10.0.64.0/20"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = false
  tags = {
    Name = "subnet_private_1"
  }
}

resource "aws_subnet" "subnet_public_2" {
  vpc_id                  = aws_vpc.vpc1.id
  cidr_block              = "10.0.80.0/22"
  availability_zone       = "ap-southeast-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "subnet_public_2"
  }
}

resource "aws_subnet" "subnet_private_2" {
  vpc_id                  = aws_vpc.vpc1.id
  cidr_block              = "10.0.84.0/24"
  availability_zone       = "ap-southeast-1b"
  map_public_ip_on_launch = false
  tags = {
    Name = "subnet_private_2"
  }
}

# * Security group for VPC #################################################
resource "aws_security_group" "sg_web" {
  name        = "sg_web"
  description = "Web server security group"
  vpc_id      = aws_vpc.vpc1.id
  tags = {
    Name = "sg-web"
  }

  # define rules
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "TLS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.vpc1.cidr_block]
  }
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.vpc1.cidr_block]
  }
  egress {
    description = "Allow all outgoing requests"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "sg_db" {
  name        = "sg_db"
  description = "Database security group"
  vpc_id      = aws_vpc.vpc1.id
  tags = {
    Name = "sg-db"
  }

  # define rules
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "TLS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.vpc1.cidr_block]
  }
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.vpc1.cidr_block]
  }
  egress {
    description = "Allow all outgoing requests"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# * IAM role #################################################
resource "aws_iam_role" "test_role" {
  name = "test_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    tag-key = "tag-value"
  }
}

resource "aws_iam_role_policy" "test_policy" {
  name = "test_policy"
  role = aws_iam_role.test_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:Describe*",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

# * Load balancer #################################################
resource "aws_lb" "load_balancer_1" {
  name               = "test-lb-tf"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_web.id] # may need to create a new sg_lb for load balancer
  subnets            = [aws_subnet.subnet_public_1.id, aws_subnet.subnet_public_2.id]

  enable_deletion_protection = true
  # access_logs {
  #   bucket = aws_s3_bucket.lb_logs.id
  #   prefix = "test-lb"
  #   enabled = true
  # }
}

resource "aws_lb_target_group" "lb_target_group_1" {
  name     = "tf-example-lb-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.vpc1.id
}

# * ECS cluster #################################################
resource "aws_ecs_cluster" "ecs_cluster_1" {
  name = "ecs_cluster_1"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# * todo: change when docker is up
resource "aws_ecs_task_definition" "web-app-service" {
  family = "service"
  container_definitions = jsonencode([
    {
      name      = "first"
      image     = "service-first"
      cpu       = 10
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
    },
    {
      name      = "second"
      image     = "service-second"
      cpu       = 10
      memory    = 256
      essential = true
      portMappings = [
        {
          containerPort = 443
          hostPort      = 443
        }
      ]
    }
  ])
  volume {
    name      = "service-storage"
    host_path = "/ecs/service-storage"
  }
  placement_constraints {
    type       = "memberOf"
    expression = "attribute:ecs.availability-zone in [ap-southeast-1a, ap-southeast-1b]"
  }
}

resource "aws_ecs_service" "web-app" {
  name            = "web-app-ui"
  cluster         = aws_ecs_cluster.ecs_cluster_1.id
  task_definition = aws_ecs_task_definition.web-app-service.arn
  desired_count   = 1
  iam_role        = aws_iam_role.test_role.arn
  depends_on      = [aws_iam_role_policy.test_policy]
  ordered_placement_strategy {
    type  = "binpack"
    field = "cpu"
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.lb_target_group_1.arn
    container_name   = "web-app"
    container_port   = 80
  }
  placement_constraints {
    type       = "memberOf"
    expression = "attribute:ecs.availability-zone in [ap-southeast-1a, ap-southeast-1b]"
  }
}

# * ASG auto scaling group #################################################
# todo: uncomment once launch configuration specified
# resource "aws_autoscaling_group" "asg_web" {
#   name                = "asg_web"
#   availability_zones  = ["ap-southeast-1a", "ap-southeast-1b"]
#   min_size            = 1
#   max_size            = 2
#   desired_capacity    = 1
#   vpc_zone_identifier = [aws_subnet.subnet_public_1.id, aws_subnet.subnet_private_1.id]
#   # launch_configuration = 
#   tag {
#     key                 = "Name"
#     value               = "web-instance"
#     propagate_at_launch = true
#   }
# }

# * Aurora #################################################
resource "aws_db_subnet_group" "db_subnet_group_aurora" {
  name       = "aurora db subnet group"
  subnet_ids = [aws_subnet.subnet_public_1.id, aws_subnet.subnet_private_1.id, aws_subnet.subnet_public_2.id, aws_subnet.subnet_private_2.id]

  tags = {
    Name = "My DB subnet group"
  }
}

# * Aurora cluster
resource "aws_rds_cluster" "rds_cluster_aurora" {
  cluster_identifier          = "aurora-cluster"
  engine                      = "aurora-mysql"
  availability_zones          = ["ap-southeast-1a", "ap-southeast-1b"]
  database_name               = "mysqldb"
  master_username             = "admin"
  manage_master_user_password = true
  backup_retention_period     = 0
  vpc_security_group_ids      = [aws_security_group.sg_db.id]
  db_subnet_group_name        = aws_db_subnet_group.db_subnet_group_aurora.name
  apply_immediately           = true
  skip_final_snapshot         = true
}

# * Aurora instance
resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 1
  identifier         = "aurora-cluster-${count.index}"
  cluster_identifier = aws_rds_cluster.rds_cluster_aurora.id
  instance_class     = "db.r5.large"
  engine             = aws_rds_cluster.rds_cluster_aurora.engine
  engine_version     = aws_rds_cluster.rds_cluster_aurora.engine_version
}

# * Internet Gateway #################################################
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc1.id

  tags = {
    Name = "igw_main_vpc1"
  }
}

# * WAF #################################################
# todo: customize this to fit use case
# resource "aws_wafv2_web_acl" "example" {
#   name        = "managed-rule-example"
#   description = "Example of a managed rule."
#   scope       = "REGIONAL"

#   default_action {
#     allow {}
#   }

#   rule {
#     name     = "rule-1"
#     priority = 1

#     override_action {
#       count {}
#     }

#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesCommonRuleSet"
#         vendor_name = "AWS"

#         rule_action_override {
#           action_to_use {
#             count {}
#           }

#           name = "SizeRestrictions_QUERYSTRING"
#         }

#         rule_action_override {
#           action_to_use {
#             count {}
#           }

#           name = "NoUserAgent_HEADER"
#         }

#         scope_down_statement {
#           geo_match_statement {
#             country_codes = ["US", "NL"]
#           }
#         }
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = false
#       metric_name                = "friendly-rule-metric-name"
#       sampled_requests_enabled   = false
#     }
#   }

#   tags = {
#     Tag1 = "Value1"
#     Tag2 = "Value2"
#   }

#   visibility_config {
#     cloudwatch_metrics_enabled = false
#     metric_name                = "friendly-metric-name"
#     sampled_requests_enabled   = false
#   }
# }

