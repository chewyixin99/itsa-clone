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



resource "aws_instance" "first-server" {
  ami           = "ami-0ebcd68de1afe59cd" # Amazon Linux 2 Kernel 5.10 AMI 2.0.20231101.0 x86_64 HVM gp2
  instance_type = "t2.micro"
}
