---
layout: post
title: Ansible Part 1 - Introduction to Ansible
description: Start using Ansible, the easy IT Automation Tool by Redhat
date: 2025-06-08 09:00 +0100
categories: [Ansible]
tags: [Ansible, Automation]  
comments: true
---
<!-- 
{% include medium_xpost.md url="https://www.medium.com" %}
 -->

## <u>What is Ansible?</u>

Ansible is an IT automation tool that allows you to use configuration as code to manage your servers (physical and virtual). 

It is open-source, easy to use and made by [RedHat](https://www.redhat.com/en). 

- [Official Ansible Documentation](https://docs.ansible.com/)


## <u>What's included in this tutorial?</u>

In this walk through you will be introduced to the basic concepts of Ansible and run, not one, but two playbooks!

You will learn: 
- How to ping your target host. 
- How to write a basic inventory and playbook 
- How to install a service (nginx) on a target host
- How to modify that service and restart it


## <u>Dependencies</u>
- This tutorial assumes you have the following set up:
    - A Control Host (must be linux) 
    - One or more Target Hosts (to follow this tutorial they must be linux)
    - The Public IP Address of each Target Host (or a private connection)
    - The SSH key to access each Target Host
- You can follow the steps in this blog to help you get prepared. [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Tutorial</u>

A basic Ansible playbook execution requires the following components:
- An inventory which provides connection information to your target hosts.
- A playbook which has the tasks you want to run. 

You can also run modules directly from the command line which can be useful for certain tasks.

### :rocket: __Step 1 - Set up inventory__

> <strong>Inventories</strong> are used to define target machines. You can specify groups and names defined in inventories as targets in your playbooks.
{: .prompt-tip }

Create the below inventory file in your user directory

```bash
mkdir ~/intro-to-ansible

nano ~/intro-to-ansible/inventory.yml 
# copy in the example inventory
```

Use this example inventory file, be sure to replace the sections with your information. 
- [Template File](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e#file-inventory_template-yml)
- [Completed Example](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e#file-inventory_example-yml)

```yaml
test_group:
  hosts:
    node1:
      ansible_host: <insert_ip>
  vars:
    ansible_ssh_private_key_file: <path_to_private_key_file>
    ansible_user: <user_you_set_up_on_vm>
    ansible_python_interpreter: /usr/bin/python3

alternative_group:
  hosts: 
    node1:

```

- This inventory file defines: 
    - a single target host: `node1`
    - the connection information to allow the control host to connect to the target host
    - two groups `test_group` and `alternative_group`
    
> <strong>Groups</strong> allow you to easily target different sets of hosts for different purposes 
{: .prompt-tip }


### :rocket: __Step 2 - Test you can reach your your target hosts__

First we are going to test you can ping your target host. We are going to do this by directly calling the ping module.

> <strong>Modules</strong> are units of code that perform actions on the target machine. They can be used on the CLI or more typically in tasks.
{: .prompt-tip }

This command tests you can ping all hosts specified in the inventory file. 

```bash
HOST_GROUP=test_group
ansible $HOST_GROUP -m ping -i ~/intro-to-ansible/inventory.yml
```

This command tests you can ping a specific host in the inventory file.

```bash
HOST=node1
ansible $HOST -m ping -i ~/intro-to-ansible/inventory.yml
```

> EXPECTED OUTPUT: you should see ansible output in your cli with a response of PONG to your PING! 

### :rocket: __Step 3 - Set up your first playbook__

> <strong>Playbooks</strong> are the instructions to be carried out by ansible. They contains plays which are in turns comprised of a set of tasks. Playbooks are written in YAML.
{: .prompt-tip }

Create the first playbook in your directory
```bash
nano ~/intro-to-ansible/myFirstPlaybook.yml 
```
Populate the playbook file with the below yaml.
- [Playbook Example](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e#file-myfirstplaybook-yml)

```yaml
---

- name: My first playbook
  hosts: test_group
  become: true
  gather_facts: true
  tasks:
    - name: Update apt
      ansible.builtin.apt:
        update_cache: yes
        cache_valid_time: 3600
    - name: Install Nginx
      ansible.builtin.apt:
        name: nginx
        state: present
    - name: Start Nginx
      ansible.builtin.service:
        name: nginx
        state: started
    - name: Visit the NGINX homepage
      ansible.builtin.uri:
        url: http://localhost
        status_code: 200
        return_content: true
      register: output
    - name: Print the output of the homepage
      ansible.builtin.debug:
        var: output

```

This playbook: 
- Installs nginx
- Starts the service
- Performs a get on the local address for the service
- Prints out the results

You can see in this playbook several important features:
- <strong>hosts</strong>: defines the target of the playbook
- <strong>tasks</strong>: sets the list of tasks for the play.
- <strong>arguments</strong>: in each task you can see key: value pairs which are arguments for the task. These can be required or optional variables and alter the command. 

### :rocket: __Step 4 - Run your first playbook__

2. Run the playbook you created

```bash
ansible-playbook -i ~/intro-to-ansible/inventory.yml ~/intro-to-ansible/myFirstPlaybook.yml 
```

> EXPECTED OUTPUT: you should see a play recap saying things have succeeded. 

### :rocket: __Step 5 - See nginx deployed to your target host__

Go to your browser and enter the public ip of your machine - you should now see the NGINX home page 

> EXPECTED OUTPUT: A generic nginx homepage

### :rocket: __Step 6 - Test Ansible Idempotency__

Ansible aims to be an Idempotent tool which means that you can run it multiple times and it should not make any changes beyond the first application as long as the state has not changed.

Run the first playbook again and you should see that the output has changed=0. This shows Ansible's idempotency.

```bash
ansible-playbook -i ~/intro-to-ansible/inventory.yml ~/intro-to-ansible/myFirstPlaybook.yml 
```

> EXPECTED OUTPUT: you should see a play recap where the number of changes is 0. 

### :rocket: __Step 7 - Run second playbook__

In this second playbook we are going to update the home page of the nginx deployment.

This will involve copying over an updated index page, templating in a value and restarting the service. 

> <strong>Templates</strong> are used in Ansible to enable dynamic configuration and inputting into documents. Ansible uses [Jinja2](https://jinja.palletsprojects.com/en/stable/templates/) for templating. 
{: .prompt-tip }

1. Create the playbook in your directory
```bash
nano ~/intro-to-ansible/mySecondPlaybook.yml 
```

2. Populate the playbook file with the below yaml.
- [Playbook Example](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e#file-mysecondplaybook-yml)

```yaml
---

- name: My second playbook
  hosts: alternative_group
  gather_facts: true
  tasks:
    - name: Copy over the template
      ansible.builtin.template:
        src: ./index.html.j2
        dest: /var/www/html/index.nginx-debian.html
      become: true
      vars:
        my_name: "Jack"
    - name: Restart Nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
      become: true
    - name: Print number of processor cores
      ansible.builtin.debug:
        var: ansible_processor_cores
    - name: Print number of processor cores
      ansible.builtin.debug:
        var: ansible_facts['processor_cores']
    - name: Print hostname
      ansible.builtin.debug:
        msg: "This computer is called: {{ inventory_hostname }}"
    - name: Visit the NGINX homepage
      ansible.builtin.uri:
        url: http://localhost
        status_code: 200
        return_content: true
      register: output
    - name: Print the output of the homepage
      ansible.builtin.debug:
        var: output
```

3\. Create the new index page in your directory
> The page needs to be in the same directory as your playbook or you need to alter the referencing in the playbook. 
{: .prompt-warning }

```bash
nano ~/intro-to-ansible/index.html.j2
```

4\. Populate the page with the below code, adding in your name:
- [Index Page Example](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e#file-index-html-j2)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to nginx!</title>
    <style>
        body {
            width: 35em;
            margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif;
        }
    </style>
</head>
<body>
{% raw %}
    <h1>Welcome to {{ my_name }}'s nginx!</h1>
    <p>If you see this page, I have successfully edited the nginx web server using Ansible.</p>
{% endraw %}
</body>
</html>
```
{: file='html.j2 - jinja template'}


5\. Run the playbook 

```bash
ansible-playbook -i ~/intro-to-ansible/inventory.yml ~/intro-to-ansible/mySecondPlaybook.yml 
```

> EXPECTED OUTPUT: You should see the playbook run successfully and if you visit the IP address of the VM then you should see the updated home page of NGINX.

### __Step 8 - Cleanup__

- Go and delete any VMs you created for the lesson - see section 4 of [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})
- If you have exposed any VMs on the public internet, then consider removing the connection if it is no longer required.

### Useful links
- [Tutorial - Code Snippets Gist](https://gist.github.com/jackmcc08/4bdeb93eb56cba38062806775c3f8e1e)

