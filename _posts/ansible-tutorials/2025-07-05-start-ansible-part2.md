---
layout: post
title: Ansible Part 2 - Introduction to Ansible
description: Start using Ansible, the easy IT Automation Tool by Redhat
date: 2025-07-05 09:00 +0100
categories: [Ansible]
tags: [Ansible, Automation]  
comments: true
---
<!-- 
{% include medium_xpost.md url="https://medium.com/@jackmcc08/ansible-part-1-introduction-to-ansible-407ed16ba276" %} -->

> [Tutorial Part 1!]({% post_url /ansible-tutorials/2025-06-08-start-ansible-part1 %})
{: .prompt-tip}

## <u>What's included in this tutorial?</u>

In the last [tutorial]({% post_url /ansible-tutorials/2025-06-08-start-ansible-part1 %}) we learnt the basics of Ansible, including running a simple inventory and running tasks on a single control host.  

In this tutorial we will take our knowledge to the next step and learn how to: 
- Target multiple hosts 
- Use `Ansible Facts` and `magic variables` to obtain key information
- Use `loops` to run the same task multiple times
- Use the `when` conditional to target the correct host or group of hosts  
- Use `tags` to run specific tasks or skip them
- Use `filters` to manipulate your data 
- Use `include_tasks` and `import_tasks` to re-use Ansible tasks
- Use `Ansible Vault` to protect your secrets
- Use `Python Virtual Environments` to define and protect your ansible-runtime setup


## <u>Dependencies</u>
- This tutorial assumes you have the following set up:
    - A Control Host (must be linux) 
    - 2 Target Hosts (to follow this tutorial they must be linux servers)
    - The Public IP Address of each Target Host (or a private connection)
    - The SSH key to access each Target Host
- You can follow the steps in this blog to help you get prepared. [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})
    - Follow section 0.5 to set up multiple target hosts
    - If you have completed part 1 you will only need to set up additional target hosts with section 0.5

## <u>Tutorial</u>

> Terminal Only: In this tutorial I use commands to create and edit files from the terminal only. You can of course use VS code or another editor as you prefer.
{: .prompt-tip }

For this tutorial we are going to: 
1. Create an Inventory File
2. In steps create and run a playbook at each stage which demonstrates each of the learning objectives
3. Create a reusable task file to demonstrate importing tasks 
4. Create several resources for demonstrating the use of Ansible-Vault

### :rocket: __Step 1 - Set up Inventory__

Create the below inventory file in your user directory

```bash
mkdir ~/intro-to-ansible-part2

nano ~/intro-to-ansible-part2/inventory.yml 
# copy in the example inventory
```
Use this example inventory file, be sure to replace the sections with your information, including the path to the correct SSH key. 
- [Template File](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/inventory.yml){:target="_blank"}
- [Completed Example](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/example_inventory.yml){:target="_blank"}

```yaml
---

test_group:
  hosts:
    myVM-1:
      ansible_host: <Insert IP Address>
    myVM-2:
      ansible_host: <Insert IP Address>
  vars:
    ansible_ssh_private_key_file: ~/.ssh/id_rsa
    ansible_user: adminuser
    ansible_python_interpreter: /usr/bin/python3
```

You can see this inventory file includes two different target hosts: `myVM-1` and `myVM-2`. 

> Replace the names of the VMs on line 5 and 7 if you have chosen different names.
{: .prompt-warning }

> You can see we have a set of vars which apply to the whole group, in this case we are using the same SSH key for both VMs. If you wanted to use different SSH keys, then you could specify the `ansible_ssh_private_key_file` path under the `ansible_host` entry for each VM.
{: .prompt-tip}

### :rocket: __Step 2 - Test you can reach your target hosts__

> RECOMMENDATION: We recommend using python virtual environments to run ansible commands. This helps keep your environment self-contained and avoid conflicts with other python projects. See our guide on how to setup and use virtual environments. [Use Python Virtual Environments]({% post_url /ansible-set-up/2025-07-05-python-virtual-environments %})

First we are going to test you can ping your target host. We are going to do this by directly calling the ping module.

This command tests you can ping all hosts specified in the inventory file. 

```bash
HOST_GROUP=test_group
ansible $HOST_GROUP -m ping -i ~/intro-to-ansible-part2/inventory.yml
```

> EXPECTED OUTPUT: you should see ansible output in your terminal with two responses of PONG to your PING! One for each VM. 

### :rocket: __Step 3 - Use ansible_facts to obtain key information__

Here we are going to create the first part of the playbook and demonstrate how to use `ansible_facts`.

The complete playbook can be found here in case you get lost:
- [Third Playbook Example](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/myThirdPlaybook.yml){:target="_blank"}

```bash
nano ~/intro-to-ansible-part2/myThirdPlaybook.yml 
# Copy in the below section into your playbook
```

> Replace the names of the VMs if you have chosen different names.
{: .prompt-warning }

{% raw %}
```yml
- name: My third playbook
  hosts: test_group
  gather_facts: true
  vars:
    vm_one: "myVM-1"
    vm_two: "myVM-2"
  tasks:
    - name: Print key system details from each VMs using ansible_facts
      ansible.builtin.debug:
        msg:
        - "This VM user is: {{ ansible_facts['user_id'] }}"
        - "This VM's IP is: {{ ansible_host }}"
        - "This VM's hostname is: {{ ansible_hostname }}"
        - "This VM's linux distribution is: {{ansible_facts['distribution'] }}"

```
{% endraw %}

So this playbook is similar to what you have seen before. It is using the debug method to print out statements in your terminal. We will mainly use this to demonstrate how to use of each of the features I am going to teach you in this tutorial.

Now run your playbook

```bash
ansible-playbook -i ~/intro-to-ansible-part2/inventory.yml ~/intro-to-ansible-part2/myThirdPlaybook.yml
```

> EXPECTED OUTPUT: you should see each VM print out the relevant information contained in the ansible_facts.

#### :bulb: LEARN: ansible_facts
`ansible_facts` are very useful variables which contain key information about the systems you are running commands on and key ansible runtime information. 

They are gathered at the beginning of a playbook run. You can stop this by setting `gather_facts` to false.

You can access these facts in a playbook run by referencing the specific variable such as `ansible_hostname` or use bracket notation `ansible_facts['hostname']`.

Find more information in the [Ansible Docs - Facts](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html){:target="_blank"}


### :rocket: __Step 4 - Use magic variables like hostvars to obtain key information__

Here you are going to demonstrate using hostvars magic variables. 

Open up your playbook using nano or your preferred text editor and add in the following task. 

> When adding in the additional tasks make sure to pay attention to the __indentation__
{: .prompt-warning}

{% raw %}
```yml
    - name: Access cached facts of all systems in the target group using Hostvars
      ansible.builtin.debug:
          msg:
          - "The VM {{ hostvars[item]['ansible_facts']['hostname'] }} ip address is: {{ hostvars[item]['ansible_host'] }}"
      loop: "{{ ansible_play_hosts }}"
  ```
{% endraw %}

Now run your playbook again. 

> EXPECTED OUTPUT: You should see the IP of each host printed, similar to the first task, but this you will see myVM-1 print out information on both itself and myVM-2 and vice-versa.  

You will see with this task how the VMs can prints information about their system and the other target host, this is the magic of hostvars, one of the magic variables! 

You will also see a demonstration of using loops by looping through the targets hosts with a `magic variable`: `anisble-play_hosts`. 	

#### :bulb: LEARN: Magic Variables  

Magic Variables are reserved variable names which contain special information, and are generated as part of the play. 

Hostvars are a particularly useful magic variable as they allow you to reference facts about all the hosts from any target host by simply referncing the hostname in the hostvars, e.g. `hostvars['myVM-1']['ansible_facts']['distribution']`. This is only after you have gathered facts.

Another example is `groups` which details all the groups and hosts in each group in your play. This can be useful for targeting different sets of hosts.

Make sure not to set other variables over magic variables. 

Find more information in the [Ansible Docs - magic variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html#information-about-ansible-magic-variables){:target="_blank"}


### :rocket: __Step 5 - Use loops to run the same task multiple times__

Now we are going to look at using another looped task to iterate through a list and run the same action again on each host. 

Add the below task to your playbook. 

```yml
    - name: Loop through a list of items and see the task be run multiple times on each host
      ansible.builtin.debug:
        var: looped_item
      loop:
      - "1. Programming isn't about what you know. It's about what you can figure out. - Chris Pine"
      - "2. Every great developer you know got there by solving problems they were unqualified to solve until they actually did it. - Patrick Mckenzie"
      - "3. It's ok to want to yeet your laptop out the window every now and then. For me it happens at least twice a day. - Jack McCarthy"
      loop_control:
        loop_var: looped_item
```

Now run your playbook.

> EXPECTED OUTPUT: You should see in the terminal each host print out the above 3 statements. You will also see which item was actioned in each task execution. This helps you debug any issues, but can get verbose. 


#### :bulb: LEARN: Loops

You can use loops to run the same task multiple times across each target host. 
The loops allow you to use different variables/inputs for each task run. 

Its important to note that loops do NOT control which hosts run the task. This is controlled by any conditionals you have in place. Loops simply run the same task again and again on your target hosts but with different inputs. 

> use `loop_control` to affect how loops are run. For example use `loop_var` to change the keyword from `item` to a different word - like `looped_item`. 
{: .prompt-tip}

Find more information in the [Ansible Docs - Loops](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html){:target="_blank"}


### :rocket: __Step 6 - Use the `when` conditional to target the correct host or group of hosts__


Now we are going to look at using the `when` keyword to control when a task is run. 

Add the below task to your playbook. 

{% raw %}
```yml
    - name: Only execute an action on one target host with the When keyword
      ansible.builtin.debug:
        msg: "I was only printed on {{ ansible_hostname }}"
      when:
      - ansible_hostname == vm_one
```
{% endraw %}

Now run your playbook.

> EXPECTED OUTPUT: You should see that the statement is only printed out by myVM-1. It also should say it is `skipping` myVM-2.

#### :bulb: LEARN: When

Use the `when` keyword to control when a task is run and on which target host. 

You can get quite complex and clever with `when` conditionals when you combine it with `filters`. 

In the above example we only run the task on the host with the right name, but you could target hosts based on the operating system, for example only running a set of tasks on windows systems. Or you could target only hosts which are in a specific inventory group. 

Find more information in the [Ansible Docs - When](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html){:target="_blank"}


### :rocket: __Step 7 - Use `tags` to run specific tasks or skip them__

Now we are going to look at another method of controlling which tasks to run using Tags. 

Add the below task to your playbook. 

> NOTE: From now on we are only going to run tasks on one of the target hosts to help reduce the logging volume to make it easier to see what we are doing. 

```yml
    - name: Use tags to control which tasks are run
      ansible.builtin.debug:
        msg: "I have the tag - print_me"
      when:
      - ansible_hostname == vm_one
      tags:
      - print_me
```

Now run your playbook using this command to run only the tagged action. 

```bash
ansible-playbook -i ~/intro-to-ansible-part2/inventory.yml ~/intro-to-ansible-part2/myThirdPlaybook.yml --tags "print_me"
```

> EXPECTED OUTPUT: You should see only the tagged action run in the terminal. You will also see the `Gathering Facts` task run. This always runs unless you set `gather_facts` to false.


Now run your playbook using this command to skip the tagged action.

```bash
ansible-playbook -i ~/intro-to-ansible-part2/inventory.yml ~/intro-to-ansible-part2/myThirdPlaybook.yml --skip-tags "print_me"
```

> EXPECTED OUTPUT: You should see all the other actions run and the tagged action won't be executed. 

> NOTE: If you don't reference any tags in your command then all tagged actions will run by default unless they are tagged with `never`. 
{: .prompt-warning}

#### :bulb: LEARN: Tags

You can use tags to control which tasks are run in your play. 

There are magic tags which have special meaning – always, never, all, tagged, untagged.

Find more information in the [Ansible Docs - Tags](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tags.html){:target="_blank"}

### :rocket: __Step 8 - Use `filters` to manipulate your data__

Use filters to manipulate data and control input and output in your playbook.

Add the below task to your playbook.

{% raw %}
```yml
    - name: Use filters to control data
      ansible.builtin.debug:
        msg:
        - "This is my unsorted list: [8,2,3,1]"
        - "This is my sorted list: {{ [8,2,3,1] | sort }}"
        - "This is using a default value if a variable isn't defined: {{ some_variable | default('details!') }}"
      when:
      - ansible_hostname == vm_one
```
{% endraw %}

Now run your playbook. 

> EXPECTED OUTPUT: You should see the unsorted list be sorted - [1,2,3,8] and you should see the default value be used in the 3rd line. 

#### :bulb: LEARN: Filters

Filters let you manipulate data. They can be a very powerful tool but can be tricky to work with. 

There are Ansible specific filters, built in filters from Jinja2, python methods and also create custom filters. 

In the example above we use the sort filter to organise a set of numbers. But you can do many things with filters for example turning dictionaries into lists, extract specific data from an output. 

> NOTE: Ansible is not really meant for data manipulation, so if you find your data is starting to require complex manipulation, it might be better to use a custom filter. 
{: .prompt-warning}

Find more information in the [Ansible Docs - Filters](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_filters.html){:target="_blank"}. 

Use the Jinja2 documentation to help you get complex! [Jinja2 Docs - Builtin filters](https://jinja.palletsprojects.com/en/stable/templates/#builtin-filters){:target="_blank"}


### :rocket: __Step 9 - Use `include_tasks` and `import_tasks` to re-use Ansible tasks__

Learn how to reuse tasks with include and imports. 

Add the below task to your playbook. 

{% raw %}
```yml
    - name: Getting the date to demonstrate dynamic inclusion of tasks
      ansible.builtin.shell: date
      register: vm_date
      when:
        - ansible_hostname == vm_one

    - name: Dynamically including this task
      ansible.builtin.include_tasks: reusable_tasks.yml
      vars:
        type_reuse: "Dynamic"
        test_var: "{{ vm_date.stdout }}"
      when:
        - ansible_hostname == vm_one

    - name: Statically including this task
      ansible.builtin.import_tasks: reusable_tasks.yml
      vars:
        type_reuse: "Static"
        test_var: "{{ vm_date.stdout }}"
      when:
        - ansible_hostname == vm_one
```
{% endraw %}

Create a new task list called `reusable_tasks.yml`. 

A code snippet can be found here:
- [reusable tasks snippet](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/reusable_tasks.yml){:target="_blank"}

```bash
nano ~/intro-to-ansible-part2/reusable_tasks.yml
# Copy in the below code
```

{% raw %}
```yml
---
- name: This is the reused task - type {{ type_reuse }}
  ansible.builtin.debug:
    msg:
    - "This is the passed down variable: {{ test_var }}"

```
{% endraw %}

Now run your playbook. 

> EXPECTED OUTPUT: You should see the statement in the reusable task being printed twice (once each for include and import). You can also see how the imported tasks replaced the import_task itself, whereas the dynamic tasks are added after the included_tasks. This is because the imported tasks are defined at the start of the playbook run and not while it is being executed. 

#### :bulb: LEARN: Include and Import Tasks

With Ansible you can reuse a variety of artefacts, including tasks, playbooks, vars, roles, etc... 

It’s important to remember there is dynamic and static reusing which has different impacts on the way tasks are reused.

Use include_tasks to dynamically run a list of tasks which importantly is affected by previous tasks (e.g. you can use variables generated by previous tasks), this also allows you to loop the reused tasks. 

Use import_tasks to statically include a list of tasks and these are defined before any other tasks are run. You cannot use loops with import_tasks.


Find more information in the [Ansible Docs - Reusing Tasks](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html#playbooks-reuse){:target="_blank"}. 

### :rocket: __Step 10 - Use `Ansible Vault` to protect your secrets__

> WARNING: Be very careful when creating files with secrets in them. Never commit them to repos (unless you have properly encrypted them) or share them publically.

We will now look at a key concern of software engineers everywhere which is how to protect your secrets. With Ansible, one tool available to us is `Ansible Vault`. 

Add the below task to your playbook. 

{% raw %}
```yml
    - name: Imports variables from the encrypted file
      ansible.builtin.include_vars:
        file: encrypted_secrets.yml
      when: 
        - ansible_hostname == vm_one

    - name: Using Ansible Vault to secure variables
      ansible.builtin.debug:
        msg:
        - "This variable was encrypted: {{ secret_var }}"
      when: 
        - ansible_hostname == vm_one
```
{% endraw %}

Create a variable file - `encrypted_secrets.yml`
- [Code Snippet Example - Unencrypted Secrets](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/unencrypted_secrets.yml){:target="_blank"}

```bash
nano ~/intro-to-ansible-part2/encrypted_secrets.yml 

# Add in your secret_var
```

```yml
secret_var: "this is my secret"
```

Now run your playbook (we haven't encrypted it yet). 

> EXPECTED OUTPUT: The tasks should run without failure and you should see your secret_var get printed.

Now encrypt the file. You will need to enter a password. If you look at the file you will see that it is now a hashed number.
- [example encrypted file](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/encrypted_secrets.yml){:target="_blank"}
- the password is `password` if you want to try decrypting it.

```bash
ansible-vault encrypt ~/intro-to-ansible-part2/encrypted_secrets.yml
```

Run your playbook again

> EXPECTED OUTPUT: The task will fail because the secrets file is encrypted, but you haven't provided the password to decrypt it! You will also see a key behaviour of Ansible here, where by default if a task fails on one host but doesn't on anohter (or is skipped - as in this example) the playbook run continues to execute on the non-failed hosts. You can control this behaviour with various keywords.

Now run your playbook again but this time with the password being requested. You will need to enter the password you used to encrypt the file.

```bash
ansible-playbook -i ~/intro-to-ansible-part2/inventory.yml ~/intro-to-ansible-part2/myThirdPlaybook.yml --ask-vault-pass
```

> EXPECTED OUTPUT: The tasks should now run without failure and you should see your secret_var get printed!


#### :bulb: LEARN: Ansible Vault

Ansible Vault lets you protect your secrets, now you can share encrypted secret files securely. 

The vault enables you to encrypt secrets and share the files securely. 

You can encrypt either specific variables or entire files.

Find more information in the [Ansible Docs - Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html){:target="_blank"}. 


### :rocket: __BONUS STAGE - Use client scripts with `Ansible Vault` to use 3rd party tools to unlock your secrets__

You can also use client scripts to provide the password from a 3rd party password storage tool. 

Below we will use a simple python script to provide the password, but you could use python or another tool to access tools like Azure Key Vault. 

[Ansible Docs - Client Script](https://docs.ansible.com/ansible/latest/vault_guide/vault_managing_passwords.html#storing-passwords-in-third-party-tools-with-vault-password-client-scripts){:target="_blank"}

Create the below python script - `print-password-client.py`
- [Code Snippet](https://github.com/jackmcc08/learn-ansible/blob/main/2_Intro_to_Ansible_part2/print-password-client.py){:target="_blank"}

```bash
nano ~/intro-to-ansible-part2/print-password-client.py
```

```py
#!/usr/bin/env python3
import sys

if __name__ == "__main__":
    secret = 'password'

    sys.stdout.write('%s\n' % secret)
```

Set the script to be executable and run your playbook.

```bash
chmod +x ~/intro-to-ansible-part2/print-password-client.py

ansible-playbook -i ~/intro-to-ansible-part2/inventory.yml ~/intro-to-ansible-part2/myThirdPlaybook.yml --vault-id @~/intro-to-ansible-part2/print-password-client.py 
```

> EXPECTED OUTPUT: The tasks should now run without failure and you should see your secret_var get printed! You didn't even need to enter the password!


### Useful Links
- [Part 2 - Code Snippets](https://github.com/jackmcc08/learn-ansible/tree/main/2_Intro_to_Ansible_part2){:target="_blank"}