---
layout: post
title: Ansible Part 4 - Run Ansible from a container
description: Leverage the power of containers for Ansible
date: 2025-10-01 22:00 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure, Pipelines, DevOps]
comments: true
---
<!-- 
{% include medium_xpost.md url="https://medium.com/@jackmcc08/run-ansible-from-an-azure-devops-pipeline-1c8b6f754de1" %} -->

## <u>What's included in this tutorial?</u>

In this tutorial, I am going to explore running Ansible in a container. 

Key Topics:
- Create 
- 

## <u>Dependencies</u>




# Run Ansible in a Container (Execution Environments)

[Execution Environments Intro](https://docs.ansible.com/ansible/latest/getting_started_ee/introduction.html)
[Ansible-Builder Guide](https://ansible.readthedocs.io/projects/builder/en/stable/scenario_guides/scenario_using_env/)

https://github.com/ansible-community/images/pkgs/container/community-ee-base


- how to use community base image to run ansible playbook from your own machine 

- how to use custom image to run ansible playbook from your own machine

- how to incorporate it into a devops pipeline 

## <u>Tutorial</u>

Going to do: 
- run Ansible in a container
- trigger it from a devops pipeline, use container service in Azure
-  


```bash
pip3 install ansible-navigator

ansible-navigator --version
ansible-builder --version 


ansible-navigator run test_localhost.yml --execution-environment-image postgresql_ee --mode stdout --pull-policy missing --container-options='--user=0'
```