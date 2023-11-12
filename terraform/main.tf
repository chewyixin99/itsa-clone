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

# * VPC INTERNET GATEWAY #################################################
resource "aws_internet_gateway" "tf-igw" {
  vpc_id = aws_vpc.tf-vpc-301.id
  tags = {
    Name = "tf-public-gateway-1"
  }
}
# * ROUTE TABLE IGW
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
# * VPC NAT GATEWAY #################################################
# * NAT GW 1
resource "aws_eip" "tf-nat-gateway-1-eip" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.tf-igw]
  tags = {
    Name      = "tf-nat-gateway-1"
    Terraform = true
  }
}
resource "aws_nat_gateway" "tf-nat-gateway-1" {
  depends_on    = [aws_subnet.tf-public-subnet-1]
  subnet_id     = aws_subnet.tf-public-subnet-1.id
  allocation_id = aws_eip.tf-nat-gateway-1-eip.id
  tags = {
    Name = "tf-nat-gateway-1"
  }
}
resource "aws_route_table" "tf-private-route-table-1" {
  vpc_id = aws_vpc.tf-vpc-301.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.tf-nat-gateway-1.id
  }
  tags = {
    Name      = "tf-private-rtb-1"
    Terraform = "true"
  }
}
resource "aws_route_table_association" "tf-private-1" {
  depends_on     = [aws_subnet.tf-private-subnet-1]
  route_table_id = aws_route_table.tf-private-route-table-1.id
  subnet_id      = aws_subnet.tf-private-subnet-1.id
}
# * NAT GW 2
resource "aws_eip" "tf-nat-gateway-2-eip" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.tf-igw]
  tags = {
    Name      = "tf-nat-gateway-2"
    Terraform = true
  }
}
resource "aws_nat_gateway" "tf-nat-gateway-2" {
  depends_on    = [aws_subnet.tf-public-subnet-2]
  subnet_id     = aws_subnet.tf-public-subnet-2.id
  allocation_id = aws_eip.tf-nat-gateway-2-eip.id
  tags = {
    Name = "tf-nat-gateway-2"
  }
}
resource "aws_route_table" "tf-private-route-table-2" {
  vpc_id = aws_vpc.tf-vpc-301.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.tf-nat-gateway-2.id
  }
  tags = {
    Name      = "tf-private-rtb-2"
    Terraform = "true"
  }
}
resource "aws_route_table_association" "tf-private-2" {
  depends_on     = [aws_subnet.tf-private-subnet-2]
  route_table_id = aws_route_table.tf-private-route-table-2.id
  subnet_id      = aws_subnet.tf-private-subnet-2.id
}
# * VPC SECURITY GROUP RULES #################################################
# * IGW-SG: in from internet, out to FE-ALB-SG
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

locals {
  sg-ingress-all = toset([aws_security_group.tf-FE-ECS-SG.id])
  sg-egress-all = toset([
    aws_security_group.tf-DB-SG.id,
    aws_security_group.tf-BE-ALB-SG.id,
    aws_security_group.tf-BE-ECS-SG.id,
    aws_security_group.tf-FE-ALB-SG.id,
    aws_security_group.tf-FE-ECS-SG.id
  ])
  sg-http-ingress = toset([
    aws_security_group.tf-BE-ALB-SG.id,
    aws_security_group.tf-FE-ALB-SG.id,
    aws_security_group.tf-FE-ECS-SG.id,
    aws_security_group.tf-IGW-SG.id
  ])
  sg-https-ingress = toset([
    aws_security_group.tf-BE-ALB-SG.id,
    aws_security_group.tf-FE-ALB-SG.id,
    aws_security_group.tf-IGW-SG.id
  ])
  sg-http-egress  = toset([])
  sg-https-egress = toset([])

}
resource "aws_security_group_rule" "tf-ingress_all" {
  for_each          = local.sg-ingress-all
  security_group_id = each.value
  type              = "ingress"
  description       = "ingress all"
  from_port         = 0
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  to_port           = 65535
}
resource "aws_security_group_rule" "tf-egress_all" {
  for_each          = local.sg-egress-all
  security_group_id = each.value
  type              = "egress"
  description       = "egress all"
  from_port         = 0
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  to_port           = 65535
}
resource "aws_security_group_rule" "tf-http-ingress" {
  for_each          = local.sg-http-ingress
  security_group_id = each.value
  type              = "ingress"
  description       = "HTTP inbound"
  from_port         = 80
  protocol          = "tcp"
  to_port           = 80
  cidr_blocks       = ["0.0.0.0/0"]
}
resource "aws_security_group_rule" "tf-https-ingress" {
  for_each          = local.sg-https-ingress
  security_group_id = each.value
  type              = "ingress"
  description       = "HTTPS inbound"
  from_port         = 443
  protocol          = "tcp"
  to_port           = 443
  cidr_blocks       = ["0.0.0.0/0"]
}
resource "aws_security_group_rule" "tf-http-egress" {
  for_each          = local.sg-http-egress
  security_group_id = each.value
  type              = "egress"
  description       = "HTTP outbound"
  from_port         = 80
  protocol          = "tcp"
  to_port           = 80
  cidr_blocks       = ["0.0.0.0/0"]
}
resource "aws_security_group_rule" "tf-https-egress" {
  for_each          = local.sg-https-egress
  security_group_id = each.value
  type              = "egress"
  description       = "HTTPS outbound"
  from_port         = 443
  protocol          = "tcp"
  to_port           = 443
  cidr_blocks       = ["0.0.0.0/0"]
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
# * ECS CLUSTER #################################################
# * TASK DEFINITION
resource "aws_ecs_task_definition" "tf-fargate-fe" {
  family                   = "tf-fargate-fe"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  task_role_arn            = "arn:aws:iam::727816232662:role/ecsTaskExecutionRole"
  execution_role_arn       = "arn:aws:iam::727816232662:role/ecsTaskExecutionRole" # todo: this is existing default IAM role
  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([
    {
      "name" : "docker-fe",
      "image" : "727816232662.dkr.ecr.ap-southeast-1.amazonaws.com/fe:latest",
      "cpu" : 0,
      "healthCheck" = {
        "command" = [
          "CMD-SHELL",
          "curl -f http://localhost/ || exit 1",
        ]
        "interval" = 30
        "retries"  = 3
        "timeout"  = 5
      }
      "portMappings" : [
        {
          "name" : "docker-fe-80-tcp",
          "containerPort" : 80,
          "hostPort" : 80,
          "protocol" : "tcp",
          "appProtocol" : "http"
        }
      ],
      "essential" : true,
      "environment" : [],
      "environmentFiles" : [],
      "mountPoints" : [],
      "volumesFrom" : [],
      "ulimits" : [],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-create-group" : "true",
          "awslogs-group" : "/ecs/",
          "awslogs-region" : "ap-southeast-1",
          "awslogs-stream-prefix" : "ecs"
        },
        "secretOptions" : []
      }
    }
  ])
}
resource "aws_ecs_task_definition" "tf-fargate-be" {
  family                   = "tf-fargate-be"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  task_role_arn            = "arn:aws:iam::727816232662:role/ecsTaskExecutionRole"
  execution_role_arn       = "arn:aws:iam::727816232662:role/ecsTaskExecutionRole" # todo: this is existing IAM role
  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }
  container_definitions = jsonencode([
    {
      "name" : "docker-be",
      "image" : "727816232662.dkr.ecr.ap-southeast-1.amazonaws.com/be:latest",
      "cpu" : 0,
      "healthCheck" = {
        "command" = [
          "CMD-SHELL",
          "curl -f http://localhost/ || exit 1",
        ]
        "interval" = 30
        "retries"  = 3
        "timeout"  = 5
      }
      "portMappings" : [
        {
          "name" : "docker-be-80-tcp",
          "containerPort" : 80,
          "hostPort" : 80,
          "protocol" : "tcp",
          "appProtocol" : "http"
        }
      ],
      "essential" : true,
      "environment" : [],
      "environmentFiles" : [],
      "mountPoints" : [],
      "volumesFrom" : [],
      "ulimits" : [],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-create-group" : "true",
          "awslogs-group" : "/ecs/",
          "awslogs-region" : "ap-southeast-1",
          "awslogs-stream-prefix" : "ecs"
        },
        "secretOptions" : []
      }
    }
  ])
}
# * ECS CLUSTER
resource "aws_ecs_cluster" "tf-ecs-cluster" {
  name = "tf-ecs-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
# * ECS SERVICES
resource "aws_ecs_service" "tf-web-app" {
  name            = "tf-web-app"
  cluster         = aws_ecs_cluster.tf-ecs-cluster.id
  task_definition = aws_ecs_task_definition.tf-fargate-fe.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    security_groups = [aws_security_group.tf-FE-ECS-SG.id]
    subnets = [
      aws_subnet.tf-public-subnet-1.id, aws_subnet.tf-public-subnet-2.id
    ]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.tf-fe-alb-target-group.arn
    container_port   = 80
    container_name   = "docker-fe"
  }
}
# todo: uncomment if can find a way to fix
# resource "aws_ecs_service" "tf-server-app" {
#   name            = "tf-server-app"
#   cluster         = aws_ecs_cluster.tf-ecs-cluster.id
#   task_definition = aws_ecs_task_definition.tf-fargate-be.arn
#   desired_count   = 2
#   launch_type     = "FARGATE"
#   network_configuration {
#     security_groups = [aws_security_group.tf-BE-ECS-SG.id]
#     subnets = [
#       aws_subnet.tf-public-subnet-1.id, aws_subnet.tf-public-subnet-2.id
#     ]
#     assign_public_ip = true
#   }
#   load_balancer {
#     target_group_arn = aws_lb_target_group.tf-be-alb-target-group.arn
#     container_port   = 80
#     container_name   = "docker-be"
#   }
# }
# * Load balancer #################################################
# * FE LB
resource "aws_lb" "tf-fe-alb" {
  name                       = "tf-fe-alb"
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.tf-FE-ALB-SG.id]
  subnets                    = [aws_subnet.tf-public-subnet-1.id, aws_subnet.tf-public-subnet-2.id]
  enable_deletion_protection = false
}

resource "aws_lb_target_group" "tf-fe-alb-target-group" {
  name        = "tf-fe-alb-target-group"
  port        = 80
  target_type = "ip"
  protocol    = "HTTP"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_lb_listener" "tf-fe-alb-listener" {
  load_balancer_arn = aws_lb.tf-fe-alb.arn
  port              = 80
  protocol          = "HTTP"
  # certificate_arn   = 
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tf-fe-alb-target-group.arn
  }
}
resource "aws_lb_listener_rule" "tf-fe-alb-listener-rule" {
  listener_arn = aws_lb_listener.tf-fe-alb-listener.arn
  priority     = 1
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tf-fe-alb-target-group.arn
  }
  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
# * BE LB
resource "aws_lb" "tf-be-alb" {
  name                       = "tf-be-alb"
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.tf-BE-ALB-SG.id]
  subnets                    = [aws_subnet.tf-public-subnet-1.id, aws_subnet.tf-public-subnet-2.id]
  enable_deletion_protection = false
}

resource "aws_lb_target_group" "tf-be-alb-target-group" {
  name        = "tf-be-alb-target-group"
  port        = 80
  target_type = "ip"
  protocol    = "HTTP"
  vpc_id      = aws_vpc.tf-vpc-301.id
}
resource "aws_lb_listener" "tf-be-alb-listener-to-ecs" {
  load_balancer_arn = aws_lb.tf-be-alb.arn
  port              = 3001
  protocol          = "HTTP"
  # certificate_arn   = 
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tf-be-alb-target-group.arn
  }
}
resource "aws_lb_listener" "tf-be-alb-listener-http" {
  load_balancer_arn = aws_lb.tf-be-alb.arn
  port              = 80
  protocol          = "HTTP"
  # certificate_arn   = 
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tf-be-alb-target-group.arn
  }
}
# resource "aws_lb_listener_rule" "tf-be-alb-listener-rule" {
#   listener_arn = aws_lb_listener.tf-be-alb-listener.arn
#   priority     = 1
#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.tf-be-alb-target-group.arn
#   }
#   condition {
#     path_pattern {
#       values = ["/*"]
#     }
#   }
# }

# * CLOUDFRONT DISTRIBUTION #################################################
# * POLICIES
resource "aws_cloudfront_origin_access_control" "tf-cloudfront-fe-origin-ac" {
  name                              = "tf-cloudfront-fe-origin-ac"
  description                       = "FE policy"
  origin_access_control_origin_type = "mediastore"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
resource "aws_cloudfront_origin_request_policy" "tf-cloudfront-origin-request-policy" {
  name = "tf-cloudfront-origin-request-policy"
  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "none"
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}
resource "aws_cloudfront_cache_policy" "tf-cloudfront-cache-policy" {
  name        = "tf-cloudfront-cache-policy"
  default_ttl = 50
  max_ttl     = 100
  min_ttl     = 1
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}
# * CLOUDFRONT
resource "aws_cloudfront_distribution" "tf-cloudfront-fe" {
  origin {
    domain_name = aws_lb.tf-fe-alb.dns_name
    origin_id   = aws_lb.tf-fe-alb.id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
    origin_shield {
      enabled              = true
      origin_shield_region = "ap-southeast-1"
    }
  }
  # todo: replace this with own created WAF
  web_acl_id      = "arn:aws:wafv2:us-east-1:727816232662:global/webacl/CreatedByCloudFront-19902cc2-6db0-4e70-9cf9-87530f072b34/2bb75c58-d8be-440b-b1ce-9c6e0e5b7350"
  enabled         = true
  is_ipv6_enabled = true
  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }
  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
    ]
    cached_methods = [
      "GET",
      "HEAD",
    ]
    compress                 = true
    default_ttl              = 0
    max_ttl                  = 0
    min_ttl                  = 0
    smooth_streaming         = false
    target_origin_id         = aws_lb.tf-fe-alb.id
    trusted_key_groups       = []
    trusted_signers          = []
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = aws_cloudfront_cache_policy.tf-cloudfront-cache-policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.tf-cloudfront-origin-request-policy.id
  }
}
resource "aws_cloudfront_distribution" "tf-cloudfront-be" {
  origin {
    domain_name = aws_lb.tf-be-alb.dns_name
    origin_id   = aws_lb.tf-be-alb.id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
    origin_shield {
      enabled              = true
      origin_shield_region = "ap-southeast-1"
    }
  }
  # todo: replace this with own created WAF
  web_acl_id      = "arn:aws:wafv2:us-east-1:727816232662:global/webacl/CreatedByCloudFront-270e6574-93cc-4443-af65-82fddc993e8a/f7882a14-78d9-407b-b940-4887534ac6ab"
  enabled         = true
  is_ipv6_enabled = true
  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }
  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
    ]
    cache_policy_id          = aws_cloudfront_cache_policy.tf-cloudfront-cache-policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.tf-cloudfront-origin-request-policy.id
    cached_methods = [
      "GET",
      "HEAD",
    ]
    compress               = true
    default_ttl            = 0
    max_ttl                = 0
    min_ttl                = 0
    smooth_streaming       = false
    target_origin_id       = aws_lb.tf-be-alb.id
    trusted_key_groups     = []
    trusted_signers        = []
    viewer_protocol_policy = "redirect-to-https"
  }
}
