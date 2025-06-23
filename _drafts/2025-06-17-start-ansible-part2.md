---
layout: post
title: Ansible Part 2 - Ansible Next Steps
description: Start using Ansible, the easy IT Automation Tool by Redhat
date: 2025-06-17 09:00 +0100
categories: [Ansible]
tags: [Ansible, Automation]  
comments: true
---
<!-- 
{% include medium_xpost.md url="https://medium.com/@jackmcc08/ansible-part-1-introduction-to-ansible-407ed16ba276" %} -->

## <u>What's included in this tutorial?</u>

In the last [tutorial]({% post_url /ansible-tutorials/2025-06-08-start-ansible-part1.md %}) we learnt the basics of ansible, including running a simple inventory and running tasks on a single control host. 

In this tutorial we will take our knowledge to the next step and learn how to: 
- Target multiple hosts 
- Use Ansible Facts to obtain key information
- Use loops to run the same task multiple times
- Use the when conditional to target the correct host or group of hosts  
- Use tags to run specific tasks or skip them.
- Use filters to manipulate your data 
- Use include_tasks and import_tasks to re-use Ansible tasks
- Use Ansible Vault to protect your secrets
- Using Python Virtual Environments to define and protect your ansible-runtime setup
- Run Ansible from an Azure DevOps Pipeline
- Run Ansible from a container

## <u>Dependencies</u>
- This tutorial assumes you have the following set up:
    - A Control Host (must be linux) 
    - 2 Target Hosts (to follow this tutorial they must be linux servers)
    - The Public IP Address of each Target Host (or a private connection)
    - The SSH key to access each Target Host
- You can follow the steps in this blog to help you get prepared. [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})
    - Follow section 0.5 to set up multiple target hosts
    - if you have completed part 1 of the tutorial you will only need to set up additional target hosts with section 0.5

## <u>Tutorial</u>

1. Create an Inventory file
    - show how you set up multiple hosts
    - show you you split them into separate groups

2. Create a playbook 1
    - this will be used to do xx 
    - Show how to set variables

3. Create a variables file 

4. Create a variables secret file (use Ansible Vault to protect it)

5. 

Keep it simple - add in documents, debug system variables
Use become: 


Read this: 
- https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnetcore/practice-troubleshoot-linux/1-2-linux-special-directories-users-package-managers

set up a postgres database on one server
https://documentation.ubuntu.com/server/how-to/databases/install-postgresql/
- Set username
- set password
- open to incoming connections
- configure mount of data disk


