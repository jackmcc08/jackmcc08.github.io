---
layout: post
title: Ansible Part 0.6 - Use Python Virtual Environments
description: Preparing your environment to start using Ansible
date: 2025-07-05 08:25 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure]  
comments: true
---

[Return to index]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Getting started with Python Virtual Environments</u>

You can use python virtual environments to isolate and configure your python environment to exactly what is required for your project and not interfere with other python projects (or let them interfere with your project). 

Python Documentation: [Virtual Environments](https://docs.python.org/3/library/venv.html)

> NOTE: It is not a good idea to commit your virtual environment to a repo, I would prefer providing set up instructions so the user can set up accordingly. 

### <u>Set up a virtual environment on your control host</u>

On your control host execute the following tasks. 

```bash
# Install the necessary packages
sudo apt install python3 python3-venv

# Create your virtual environment
python3 -m venv <insert-venv-name>

# e.g. python3 -m venv learn-ansible-venv
```

Activate your virtual environment and install packages

```bash
# Activate the venv
source <insert-venv-name>/bin/activate

# e.g. source learn-ansible-venv/bin/activate

# install dependencies
pip install ansible-core --upgrade 
```

> EXPECTED OUTPUT: when activated you should see your virtual environment in your terminal prompt. 

```bash
user@mycomputer:~$

source learn-ansible-venv/bin/activate

(learn-ansible-venv) user@mycomputer:~$ 
```




