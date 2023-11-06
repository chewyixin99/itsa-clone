# https://registry.terraform.io/providers/hashicorp/aws/latest/docs

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      # version = "" # optional
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = "ap-southeast-1"
}


# vpc template
resource "aws_instance" "first_server" {
  ami           = "ami-0ebcd68de1afe59cd" # Amazon Linux 2 Kernel 5.10 AMI 2.0.20231101.0 x86_64 HVM gp2
  instance_type = "t2.micro"
  tags = {
    Name : "first_server" # can be anything
  }
}

# vpc template
resource "aws_vpc" "first_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name : "first_vpc"
  }
}

# subnet tempalte
resource "aws_subnet" "subnet_1" {
  vpc_id     = aws_vpc.first_vpc.id # attaching subnet specific to a vpc
  cidr_block = "10.0.1.0/24"        # must fall within vpc range
  tags = {
    Name = "first_vpc-subnet_1"
  }
}
