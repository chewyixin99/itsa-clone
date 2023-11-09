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

# terraform import <resource>.<resource_name> <resource_ID>
# * VPC #################################################
resource "aws_vpc" "tf-vpc-301" {
  cidr_block = "10.0.0.0/24"
  tags = {
    "Name" = "tf-vpc-301"
  }
}

# * VPC SUBNETS #################################################
resource "aws_subnet" "tf-private-subnet-1" {
  vpc_id            = aws_vpc.tf-vpc-301.id
  cidr_block        = "10.0.0.128/26"
  availability_zone = "ap-southeast-1a"
  tags = {
    "Name" = "tf-private-subnet-1"
  }
  tags_all = {
    "Name" = "tf-private-subnet-1"
  }
}
resource "aws_subnet" "tf-private-subnet-2" {
  vpc_id            = aws_vpc.tf-vpc-301.id
  cidr_block        = "10.0.0.192/26"
  availability_zone = "ap-southeast-1b"
  tags = {
    "Name" = "tf-private-subnet-2"
  }
  tags_all = {
    "Name" = "tf-private-subnet-2"
  }
}
resource "aws_subnet" "tf-public-subnet-1" {
  vpc_id            = aws_vpc.tf-vpc-301.id
  cidr_block        = "10.0.0.0/26"
  availability_zone = "ap-southeast-1a"
  tags = {
    "Name" = "tf-public-subnet-1"
  }
  tags_all = {
    "Name" = "tf-public-subnet-1"
  }
}
resource "aws_subnet" "tf-public-subnet-2" {
  vpc_id            = aws_vpc.tf-vpc-301.id
  availability_zone = "ap-southeast-1b"
  cidr_block        = "10.0.0.64/26"
  tags = {
    "Name" = "tf-public-subnet-2"
  }
  tags_all = {
    "Name" = "tf-public-subnet-2"
  }
}

# * VPC INTERNET #################################################
resource "aws_internet_gateway" "tf-igw" {
  vpc_id = aws_vpc.tf-vpc-301.id
  tags = {
    Name = "tf-public-gateway-1"
  }
}
# * ROUTE TABLES #################################################
resource "aws_route_table" "tf-public-route-table" {
  vpc_id = aws_vpc.tf-vpc-301.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.tf-igw.id
  }
  tags = {
    Name      = "tf-public-rtb"
    Terraform = "true"
  }
}
resource "aws_route_table_association" "tf-public-1" {
  depends_on     = [aws_subnet.tf-public-subnet-1]
  route_table_id = aws_route_table.tf-public-route-table.id
  subnet_id      = aws_subnet.tf-public-subnet-1.id
}
resource "aws_route_table_association" "tf-public-2" {
  depends_on     = [aws_subnet.tf-public-subnet-2]
  route_table_id = aws_route_table.tf-public-route-table.id
  subnet_id      = aws_subnet.tf-public-subnet-2.id
}
resource "aws_route_table_association" "tf-private-1" {
  depends_on     = [aws_subnet.tf-private-subnet-1]
  route_table_id = aws_route_table.tf-public-route-table.id
  subnet_id      = aws_subnet.tf-private-subnet-1.id
}
resource "aws_route_table_association" "tf-private-2" {
  depends_on     = [aws_subnet.tf-private-subnet-2]
  route_table_id = aws_route_table.tf-public-route-table.id
  subnet_id      = aws_subnet.tf-private-subnet-2.id
}
# * VPC SECURITY GROUP RULES #################################################
# * IGW-SG: in from internet, out to FE-ALB-SG
resource "aws_security_group_rule" "public-https-in" {
  type              = "ingress"
  description       = "in from internet, https"
  from_port         = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.tf-IGW-SG.id
  to_port           = 443
}
resource "aws_security_group_rule" "public-http-in" {
  type              = "ingress"
  description       = "in from internet, http"
  from_port         = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.tf-IGW-SG.id
  to_port           = 80
}
resource "aws_security_group_rule" "public-out" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.tf-IGW-SG.id
}
resource "aws_security_group_rule" "https-out" {
  type                     = "egress"
  description              = "out to fe-alb-sg"
  from_port                = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-FE-ALB-SG.id
  security_group_id        = aws_security_group.tf-IGW-SG.id
  to_port                  = 443
}
resource "aws_security_group_rule" "http-out" {
  type                     = "egress"
  description              = "out to fe-alb-sg"
  from_port                = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-FE-ALB-SG.id
  security_group_id        = aws_security_group.tf-IGW-SG.id
  to_port                  = 80
}
# * FE-ALB-SG: in from internet gateway, out to FE-ECS-SG
resource "aws_security_group_rule" "tf-in_fe-alb-sg-https" {
  type                     = "ingress"
  description              = "in from internet gateway, https"
  from_port                = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-IGW-SG.id
  security_group_id        = aws_security_group.tf-FE-ALB-SG.id
  to_port                  = 443
}
resource "aws_security_group_rule" "tf-in_fe-alb-sg-http" {
  type                     = "ingress"
  description              = "in from internet gateway, http"
  from_port                = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-IGW-SG.id
  security_group_id        = aws_security_group.tf-FE-ALB-SG.id
  to_port                  = 80
}
resource "aws_security_group_rule" "tf-out_fe-alb-sg" {
  type                     = "egress"
  description              = "out to fe-ecs-sg"
  from_port                = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-FE-ECS-SG.id
  security_group_id        = aws_security_group.tf-FE-ALB-SG.id
  to_port                  = 80
}
# * FE-ECS-SG: in from FE-ALB-SG, out to BE-ALG-SG
resource "aws_security_group_rule" "tf-in_fe-ecs-sg" {
  type                     = "ingress"
  description              = "in from fe-alb-sg"
  from_port                = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-FE-ALB-SG.id
  security_group_id        = aws_security_group.tf-FE-ECS-SG.id
  to_port                  = 80
}
resource "aws_security_group_rule" "tf-out_fe-ecs-sg" {
  type                     = "egress"
  description              = "out to be-alb-sg"
  from_port                = 3001
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-BE-ALB-SG.id
  security_group_id        = aws_security_group.tf-FE-ECS-SG.id
  to_port                  = 3001
}
# * BE-ALB-SG: in from FE-ECS-SG, out to BE-ECS-SG
resource "aws_security_group_rule" "tf-in_be-alb-sg" {
  type                     = "ingress"
  description              = "in from fe-ecs-sg"
  from_port                = 3001
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-FE-ECS-SG.id
  security_group_id        = aws_security_group.tf-BE-ALB-SG.id
  to_port                  = 3001
}
resource "aws_security_group_rule" "tf-out_be-alb-sg" {
  type                     = "egress"
  description              = "out to be-ecs-sg"
  from_port                = 3001
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-BE-ECS-SG.id
  security_group_id        = aws_security_group.tf-BE-ALB-SG.id
  to_port                  = 3001
}
# * BE-ECS-SG: in from BE-ALB-SG, out to DB-SG
resource "aws_security_group_rule" "tf-in_be-ecs-sg" {
  type                     = "ingress"
  description              = "in from be-alb-sg"
  from_port                = 3001
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-BE-ALB-SG.id
  security_group_id        = aws_security_group.tf-BE-ECS-SG.id
  to_port                  = 3001
}
resource "aws_security_group_rule" "tf-out_be-ecs-sg" {
  type                     = "egress"
  description              = "out to db-sg"
  from_port                = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-DB-SG.id
  security_group_id        = aws_security_group.tf-BE-ECS-SG.id
  to_port                  = 3306
}
# * DB-SG: in from BE-ECS-SG, no egress
resource "aws_security_group_rule" "tf-in_db-sg" {
  type                     = "ingress"
  description              = "in from be-ecs-sg"
  from_port                = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.tf-BE-ECS-SG.id
  security_group_id        = aws_security_group.tf-DB-SG.id
  to_port                  = 3306
}

# * VPC SECURITY GROUPS #################################################
resource "aws_security_group" "tf-IGW-SG" {
  name        = "tf-IGW-SG"
  description = "Managed by Terraform - in from internet, out to fe-alb"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_security_group" "tf-FE-ALB-SG" {
  name        = "tf-FE-ALB-SG"
  description = "Managed by Terraform - in from internet gateway, out to fe-ecs"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_security_group" "tf-FE-ECS-SG" {
  name        = "tf-FE-ECS-SG"
  description = "Managed by Terraform - in from fe-alb-sg, out to be-alb-sg"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_security_group" "tf-BE-ALB-SG" {
  name        = "tf-BE-ALB-SG"
  description = "Managed by Terraform - in from fe-ecs-sg, out to be-ecs-sg"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_security_group" "tf-BE-ECS-SG" {
  name        = "tf-BE-ECS-SG"
  description = "Managed by Terraform - in from be-alb-sg, out to db-sg"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_security_group" "tf-DB-SG" {
  name        = "tf-DB-SG"
  description = "Managed by Terraform - in from be-ecs-sg"
  vpc_id      = aws_vpc.tf-vpc-301.id
}


# * ECS cluster #################################################
# resource "aws_ecs_cluster" "tf-ecs-cluster" {
#   name = "tf-ecs-cluster"
#   setting {
#     name  = "containerInsights"
#     value = "enabled"
#   }
# }

# todo: change when docker is up
# resource "aws_ecs_task_definition" "web-app-service" {
#   family = "service"
#   container_definitions = jsonencode([
#     {
#       name      = "first"
#       image     = "service-first"
#       cpu       = 10
#       memory    = 512
#       essential = true
#       portMappings = [
#         {
#           containerPort = 80
#           hostPort      = 80
#         }
#       ]
#     },
#     {
#       name      = "second"
#       image     = "service-second"
#       cpu       = 10
#       memory    = 256
#       essential = true
#       portMappings = [
#         {
#           containerPort = 443
#           hostPort      = 443
#         }
#       ]
#     }
#   ])
#   volume {
#     name      = "service-storage"
#     host_path = "/ecs/service-storage"
#   }
#   placement_constraints {
#     type       = "memberOf"
#     expression = "attribute:ecs.availability-zone in [ap-southeast-1a, ap-southeast-1b]"
#   }
# }

# * Load balancer #################################################
# resource "aws_lb" "load_balancer_1" {
#   name               = "test-lb-tf"
#   internal           = false
#   load_balancer_type = "application"
#   security_groups    = [aws_security_group.sg_web.id] # may need to create a new sg_lb for load balancer
#   subnets            = [aws_subnet.subnet_public_1.id, aws_subnet.subnet_public_2.id]

#   enable_deletion_protection = false
#   # access_logs {
#   #   bucket = aws_s3_bucket.lb_logs.id
#   #   prefix = "test-lb"
#   #   enabled = true
#   # }
# }

# resource "aws_lb_target_group" "lb_target_group_1" {
#   name     = "tf-example-lb-tg"
#   port     = 80
#   protocol = "HTTP"
#   vpc_id   = aws_vpc.vpc1.id
# }

# * IAM role #################################################
# backend service, SCS, db permission
# resource "aws_iam_role" "test_role" {
#   name = "test_role"
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = "sts:AssumeRole"
#         Effect = "Allow"
#         Sid    = ""
#         Principal = {
#           Service = "ec2.amazonaws.com"
#         }
#       },
#     ]
#   })

#   tags = {
#     tag-key = "tag-value"
#   }
# }

# define later
# resource "aws_iam_role_policy" "test_policy" {
#   name = "test_policy"
#   role = aws_iam_role.test_role.id

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = [
#           "ec2:Describe*",
#         ]
#         Effect   = "Allow"
#         Resource = "*"
#       },
#     ]
#   })
# }


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

# * Internet Gateway #################################################
# resource "aws_internet_gateway" "igw" {
#   vpc_id = aws_vpc.vpc1.id

#   tags = {
#     Name = "igw_main_vpc1"
#   }
# }

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

