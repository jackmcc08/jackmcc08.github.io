---
layout: post
title: Ansible Part 0.1 - Set up Control Host
description: Preparing your environment to start using Ansible
date: 2025-06-07 08:30 +0100
categories: [Ansible]
tags: [Ansible, Automation, WSL]  
comments: true
---

[Return to index]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Set up your Control Host</u>

Your control host is where you execute the ansible commands to run your playbook. This tutorial guides you through how to configure your control host. 

> NOTE: all of the below instructions are taken from various sources, the code outlined is just one way of setting up your control host and is my preferred set up.
{: .prompt-info}


## <u>Dependencies</u>

This tutorial assumes you have:
- A windows machine capable of setting up WSL
- Or ability to set up a control host with a VM.
- The below instructions assume you are using Ubuntu 22.04 or 24.04 LTS but other linux distributions should work with only minimal adaptation.


## <u>Quick-Start</u>
- Assuming you have a linux machine, you can run the script in this folder to set up python and ansible-core. 
    - Quickstart Script: [ Code Snippet: bash script](https://github.com/jackmcc08/learn-ansible/blob/main/0_SetUp/1_setup_control_node_quickstart.sh)

## <u>Tutorial</u>

> Requirements for running Ansible
- Ansible must be run from a Linux Machine
- The control host must be capable of running python
    - Python 3.8 
- The control host must be able to connect to the target hosts
{: .prompt-info }



### :rocket: __Step 1 - Create a Linux Machine using WSL__

> There are multiple ways to create a linux machine, including: 
- Create a VM in a cloud environment [guide](https://learn.microsoft.com/en-us/azure/developer/ansible/install-on-linux-vm?tabs=azure-cli#create-a-virtual-machine)
- Use WSL on a windows machine [guide](https://learn.microsoft.com/en-us/windows/wsl/setup/environment)
- Install a linux OS on your own hardware [guide](https://ubuntu.com/tutorials/install-ubuntu-desktop#1-overview)
{: .prompt-tip }

This tutorial will cover how to create a linux machine with WSL, but the provided links can help you with alternatives. 

Follow the instructions in this guide on setting up WSL: [Microsoft WSL Setup guide](https://learn.microsoft.com/en-us/windows/wsl/setup/environment). Use the modifications below. 

1. Use the below command to install <strong>Ubuntu 24.04</strong> on your powershell terminal

```ps
wsl --install --distribution Ubuntu-24.04
```

2\. Set your username and password 

> REMEMBER YOUR PASSWORD
{: .prompt-warning }

Once you have WSL installed and set up you can continue with the following steps.

To access your WSL environment from your laptop:
1. Open a powershell terminal
2. Type `wsl` and hit enter

### :rocket: __Step 2 - Install Python Dependencies:__

Install python3 and pip

```bash
sudo apt update

# Optional - Upgrade system 
# sudo apt -y upgrade

# Check if python3 is installed 
python3 -V
# you need minimum 3.8

# Install python3
sudo apt install python3 -y

# Install Pip package manager

sudo apt install -y python3-pip
```

### :rocket: __Step 3 - Install Ansible (ansible-core)__

Ansible can be installed as either `ansible` or `ansible-core`. 

- `ansible` contains many additional collections that extend ansible.
- `ansible-core` is a lightweight installation which does not contain additional collections by default, but these can be installed as necessary. 

In this guide we will install `ansible-core`
- [For futher installation options - Extended Ansible Installation Guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible)

> NOTE: Depending on your preferences you may wish to install python packages in a virtual environment, in this tutorial we will not use this.
{: .prompt-info}

> NOTE: For ubuntu install ansible via pip not apt. This gives you the latest version.
{: .prompt-warning }

```bash 
# Install ansible-core
python3 -m pip install --user ansible-core
# If you need to install system wide
python3 -m pip install --user ansible-core --break-system-packages
# If you have pipx installed
pipx install ansible-core --upgrade
```



### :bulb: __LEARN: Installing Roles, Collections and Python Dependencies__

Depending on what you are trying to do, you can extend Ansible through additional roles and collections. 

#### **Roles and Collections**

<strong>Roles</strong> are used in Ansible to group together tasks along with defined variables, templates and documents to execute a specific set of actions. 

<strong>Collections</strong> are used to group together related tasks, roles, modules and plugins which are used to execute related sets of actions. 

Roles and collections can be installed through `ansible-galaxy`. 
- [Ansible User Guide](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html)

> NOTE: most roles are defined as part of a collection, but you can install individual roles as well.
{: .prompt-info }

```bash
# Install a collection 
ansible-galaxy collection install <collection-name>
# e.g.
ansible-galaxy collection install azure.azcollection

# Install a role 
ansible-galaxy install <role-name>
# e.g.
ansible-galaxy install geerlingguy.apache
```

#### **Python Dependencies**

Some ansible modules and plugins have python dependencies which need to be installed. 

Typically the module guidance will detail what needs to be installed. 
- e.g. This collection has specific python dependencies and provides guidance on how to install them: [Azure Collection](https://github.com/ansible-collections/azure?tab=readme-ov-file#requirements)

```bash
# Example install commands for the Azure collection
# With pip
sudo pip3 install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt

# With pipx
pipx runpip ansible install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt
```

#### **Requirements Files**

If you have a playbook which has different dependencies on roles and collections then you can define them in a requirements file and install them all by referencing the file. 

1. Define the requirements in `requirements.yml`

```yaml
---
# EXAMPLE Requirements.yml file
collections:
    # from galaxy
    - name: kubernetes.core
    version: ">=3.2.0"
    - name: ansible.posix
    version: ">=1.5.4"
    - name: community.general
    version: ">=9.1.0"

roles:
  # Install a role from Ansible Galaxy.
  - name: geerlingguy.java
    version: "1.9.6" # note that ranges are not supported for roles
```

2. Install using ansible-galaxy
```bash
ansible-galaxy install -r ./requirements.yml
```

