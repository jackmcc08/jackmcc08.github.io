---
layout: post
title: Ansible Part 0 - Set up Environment
description: Preparing your environment to start using Ansible
date: 2025-06-07 09:00 +0100
categories: [Ansible]
tags: [Ansible, Automation]  
comments: true
---
<!-- 
{% include medium_xpost.md url="https://www.medium.com" %} 
-->


## <u>What's included in this tutorial?</u>

In this walk through you will set up your own environment (the control host) and a target host in preparation to use ansible.

> There are many different ways to set up control and target hosts, so I have explained just a limited range of options to get you started.
{: .prompt-info}

You will learn: 
- Set up a linux environment on a windows machine using WSL
- How to install ansible on your machine
- Create an Azure VM to act as a target host
- How to setup SSH access to the target from the control host
- How to tear down your target host once you are finished.

## <u>Dependencies</u>

- This tutorial assumes you have the following: 
    - A windows machine to set up WSL on (if you have a linux machine already then great). If your machine cannot set up WSL but you can access the internet then you could set up a second linux VM to act as your control host. 
    - Access to the internet

## <u>Tutorial</u>
 
There are four parts to this tutorial, sections 1-3 should be completed before using Ansible in following tutorials. Section 4 is for removing your target host once you are finished. 

Sections: 
- 0.1 [Configuring your control host]({% post_url /ansible-set-up/2025-06-07-configure-control-host %})
- 0.2 [Create a target host - Azure VM]({% post_url /ansible-set-up/2025-06-07-create-target-host %})
- 0.3 [Configure target host]({% post_url /ansible-set-up/2025-06-07-configure-target-host %})
- 0.4 [Destroy target host - Azure VM]({% post_url /ansible-set-up/2025-06-07-destroy-target-host %})

Now - go and complete sections 0.1 to 0.3 above and you should be ready for the [Introduction to Ansible tutorial part 1!]({% post_url /ansible-tutorials/2025-06-08-start-ansible-part1 %}) 