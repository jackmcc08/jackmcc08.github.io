---
layout: post
title: Ansible Part 0.3 - Configure the target host
description: Preparing your environment to start using Ansible
date: 2025-06-07 08:20 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure]  
comments: true
---

[Return to index]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Configure Target Host</u>

This guide ensures that your target host can be accessed via passwordless SSH and can run python (a requirement for some Ansible Tasks).

## <u>Dependencies</u>
- This tutorial assumes you already have
  - a control host
  - a target machine (whether a VM or Physical Machine)
- Follow steps 0.1 and 0.2 in this [guide]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %}) if you have not.


## <u>Tutorial</u>

### :rocket: __Step 1 - Configure passwordless SSH:__

> This guide is based on this tutorial [DigitalOcean SSH key guide](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)
{: .prompt-tip }

> READ: If you set up the VM using the previous guide you will not need to carry out 1 -> 3, you should still check you can SSH into the machine and you don't require a password.
{: .prompt-warning }

1. Create an SSH Key on your Control Host


```bash
ssh-keygen -m PEM -t rsa -b 4096
# Enter the file name - default id_rsa
# Enter with NO passphrase
```

2\. Ensure the Private Key is stored on your Control Host 

- You will need to reference the private key file in the ansible inventory file

- Typically keys are stored in the users `~/.ssh` folder. 

- If you call your key `id_rsa` then when you execute SSH it will look for it by default, otherwise you need to specify which key you want to use.

3\. Copy over the SSH Key to the target hosts
```bash
ssh-copy-id username@remote_host
# Type in the password for the remote host
```

4\. Ensure your designated user can SSH into the box without the password. 

- SSH into the target machine

```bash
ssh <username>@<ip address> 

# e.g.
ssh jack@10.0.10.10
```

> EXPECTED OUTPUT: You should be able to ssh in without your password. 

If a password is still asked for then you need to update the sshd config on the target machine 

```bash
sudo nano /etc/ssh/sshd_config
# add in the below text
PasswordAuthentication no

# Restart the ssh Service
sudo systemctl restart ssh
```

### :rocket: __Step 2 - Install dependencies:___
For ansible modules that run Ansible generate Python code, the target host needs to be able to run python. This will be detailed in the module documentation

Install Python (if not already installed):

```bash 
sudo apt install python3 -y
```
