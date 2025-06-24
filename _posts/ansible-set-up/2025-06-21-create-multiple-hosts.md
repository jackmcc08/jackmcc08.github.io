---
layout: post
title: Ansible Part 0.5 - Create multiple target hosts
description: Preparing your environment to start using Ansible
date: 2025-06-21 08:25 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure]  
comments: true
---

[Return to index]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Create multiple Target Hosts with Azure VMs</u>

Your target host is the server that you want to configure using Ansible. This tutorial creates tow or more Azure VMs as a target machine. 

This can be done in a variety of ways and I have included guidance on how to do this both manually in the Azure Portal and as a bonus via using Ansible.

The Ansible Code will be run on your managed node and you will need a personal Azure Subscription with some credit in it. 

> SAVE CREDITS: Destroy the VM using [lesson 0.4]({% post_url /ansible-set-up/2025-06-07-destroy-target-host %}) as soon as possible after completing the tutorial to avoid incurring additional cost.
{: .prompt-warning }

> This tutorial is based on this [Microsoft Guide](https://learn.microsoft.com/en-us/azure/developer/ansible/vm-configure?tabs=ansible)
{: .prompt-tip }

## <u>Dependencies</u>
- If you are setting the VMs up via Ansible you have configured your control host appropriately as per this [guide]({% post_url /ansible-set-up/2025-06-07-configure-control-host %})
- You will need a personal Azure Subscription [Microsoft Guide](https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account?msockid=2e4db245fd3360862ed4a7edfc88611d) 
- You will need a service principle for your Azure Subscription. See the tutorials here: 
    - [Microsoft: Create a Service Principle](https://learn.microsoft.com/en-us/azure/developer/ansible/create-ansible-service-principal?tabs=azure-cli)
        - Follow the full tutorial
    - [Microsoft: Store secrets for consumption by Ansible](https://learn.microsoft.com/en-us/azure/developer/ansible/install-on-linux-vm?tabs=azure-cli#create-azure-credentials)
        -  I recommend following [option 1](https://learn.microsoft.com/en-us/azure/developer/ansible/install-on-linux-vm?tabs=azure-cli#-option-1-create-ansible-credentials-file) and storing your credentials on the control host 
- You will need the Azure Command Line installed as part of step 4. [Microsoft Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?view=azure-cli-latest&pivots=apt)

## <u>Tutorial - Using the Azure Portal to create the VMs</u>

### __1. :rocket: Create the first VM__
Follow the below guide to create a VM in the portal.

Please use the following configuration when creating your VM: 

```text
Resource Group Name: learnAnsibleRG
Virtual Machine Name : myVM-1
Region: uksouth
Image: Ubuntu Server 24.04
Size: Standard_DS1_v2

Username: adminuser

SSH Key: SSH Public Key
Source: Generate New Key Pair
Key Name: myKey
```

> PUBLIC IP: Make sure to have a public IP address otherwise you will not be able to connect unless your control host is in the same private network. 
{: .prompt-warning}

> DOWNLOAD SSH KEY: Ensure you download the private key! Move the `.pem` file to your `~/.ssh` directory
{: .prompt-warning }

Follow this guide: [Microsoft Guide to Create A VM](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)

### __2. :rocket: Create the second VM__
Follow the guide in Step 1 but with the following modifications: 
- VM Name: `myvm-2`
- Key: use the same key which you downloaded when you created `myVM-1`
- You will need a different NIC and Public IP Address but you can re-use all the same resources (e.g. NSG, RG, etc...)

Make sure to record the Public IP address. 

## <u>Tutorial - Using Ansible to Create the VM</u>

> All below commands are executed from a bash terminal. 
{: .prompt-info }


### __1. :rocket: Create an SSH Key Pair on your control node__

- This will be used as the SSH key to access both VMs

```bash
ssh-keygen -m PEM -t rsa -b 4096
# Enter the file name - default id_rsa
# Enter with NO passphrase

```
> EXPECTED OUTPUT: you should see two files `id_rsa` and `id_rsa.pub`
{: .prompt-tip }

### __2. :rocket: Create and update the playbook with your desired configuration__ 

- create the playbook
```bash
mkdir ~/create_vms_ansible
nano  ~/create_vms_ansible/build_multiple_azure_vms.yml
# Copy and Paste the below YAML in
# Replace the names with your choices
# copy in the public key created in step 1 - should be saved in id_rsa.pub file in .ssh
# you can also use a SED command
PUBLIC_KEY=$(cat ~/.ssh/id_rsa.pub)
sed -i "s|PUBLIC_KEY_DATA|$PUBLIC_KEY|g" ~/create_vms_ansible/build_azure_vms.yml
```

Copy in the below playbook
- [Git Repo Code Snippet](https://github.com/jackmcc08/learn-ansible/blob/main/0_SetUp/5_build_multiple_azure_vms.yml)
- Update the details in the `vars` section as necessary
- Copy the public key value into the `PUBLIC_KEY_DATA` placeholder. I recommend using the sed command detailed above to help.

{% raw %}
```yaml
---
# This playbook uses the Azure ansible modules to create a VM in Azure.
# You need to have the service principle details as per the dependencies in the tutorial

- name: Create Multiple Azure VMs
  hosts: localhost
  connection: local
  vars:
    resource_group_name: learnAnsibleRG
    location: uksouth
    vnet_name: myVnet
    subnet_name: mySubnet
    nsg_name: myNetworkSecurityGroup
    vm_username: adminuser
    key_data: "PUBLIC_KEY_DATA"
    vm_one:
      public_ip_name: myPublicIP-1
      nic_name: myNIC-1
      vm_name: myVM-1
      vm_size: Standard_DS1_v2
    vm_two:
      public_ip_name: myPublicIP-2
      nic_name: myNIC-2
      vm_name: myVM-2
      vm_size: Standard_DS1_v2

  tasks:
  - name: Create resource group
    azure.azcollection.azure_rm_resourcegroup:
      name: "{{ resource_group_name }}"
      location: "{{ location }}"

  - name: Create virtual network
    azure.azcollection.azure_rm_virtualnetwork:
      resource_group: "{{ resource_group_name }}"
      name: "{{ vnet_name }}"
      address_prefixes: "10.0.0.0/16"

  - name: Add subnet
    azure.azcollection.azure_rm_subnet:
      resource_group: "{{ resource_group_name }}"
      name: "{{ subnet_name }}"
      address_prefix: "10.0.1.0/24"
      virtual_network: "{{ vnet_name }}"

  - name: Create Network Security Group that allows SSH and HTTP
    azure.azcollection.azure_rm_securitygroup:
      resource_group: "{{ resource_group_name }}"
      name: "{{ nsg_name }}"
      rules:
        - name: SSH
          protocol: Tcp
          destination_port_range: 22
          access: Allow
          priority: 1001
          direction: Inbound
        - name: HTTP
          protocol: Tcp
          destination_port_range: 80
          access: Allow
          priority: 1002
          direction: Inbound

# This is created using blocks for ease of copying in a tutorial, 
# it would be preferable to use a loop and include_task feature of ansible to avoid duplicating the information. 
  - name: Create VM Block 
    block:
    - name: Create public IP address
      azure.azcollection.azure_rm_publicipaddress:
        resource_group: "{{ resource_group_name }}"
        allocation_method: Static
        name: "{{ vm_one.public_ip_name }}"
      register: output_ip_address_vm_one

    - name: Public IP of VM
      ansible.builtin.debug:
        msg: "The public IP is {{ output_ip_address_vm_one.state.ip_address }}."
    
    - name: Create virtual network interface card
      azure.azcollection.azure_rm_networkinterface:
        resource_group: "{{ resource_group_name }}"
        name: "{{ vm_one.nic_name }}"
        virtual_network: "{{ vnet_name }}"
        subnet: "{{ subnet_name }}"
        security_group: "{{ nsg_name }}"
        ip_configurations:
        - name: ipconfig1
          public_ip_address_name: "{{ vm_one.public_ip_name }}"
          primary: true

    - name: Create VM
      azure.azcollection.azure_rm_virtualmachine:
        resource_group: "{{ resource_group_name }}"
        name: "{{ vm_one.vm_name }}"
        vm_size: "{{ vm_one.vm_size }}"
        admin_username: "{{ vm_username }}"
        ssh_password_enabled: false
        ssh_public_keys:
          - path: "/home/{{ vm_username }}/.ssh/authorized_keys"
            key_data: "{{ key_data }}"
        network_interfaces: "{{ vm_one.nic_name }}"
        image:
          offer: 0001-com-ubuntu-server-jammy
          publisher: Canonical
          sku: 22_04-lts
          version: latest

    - name: Public IP of VM
      ansible.builtin.debug:
        msg: "The public IP is {{ output_ip_address_vm_one.state.ip_address }}."

    - name: Set IP of VM
      ansible.builtin.set_fact:
        vm_one_public_ip: "{{ output_ip_address_vm_one.state.ip_address }}"

      
  - name: Create VM Block 
    block:
    - name: Create public IP address
      azure.azcollection.azure_rm_publicipaddress:
        resource_group: "{{ resource_group_name }}"
        allocation_method: Static
        name: "{{ vm_two.public_ip_name }}"
      register: output_ip_address_vm_two

    - name: Public IP of VM
      ansible.builtin.debug:
        msg: "The public IP is {{ output_ip_address_vm_two.state.ip_address }}."
    
    - name: Create virtual network interface card
      azure.azcollection.azure_rm_networkinterface:
        resource_group: "{{ resource_group_name }}"
        name: "{{ vm_two.nic_name }}"
        virtual_network: "{{ vnet_name }}"
        subnet: "{{ subnet_name }}"
        security_group: "{{ nsg_name }}"
        ip_configurations:
        - name: ipconfig1
          public_ip_address_name: "{{ vm_two.public_ip_name }}"
          primary: true

    - name: Create VM
      azure.azcollection.azure_rm_virtualmachine:
        resource_group: "{{ resource_group_name }}"
        name: "{{ vm_two.vm_name }}"
        vm_size: "{{ vm_two.vm_size }}"
        admin_username: "{{ vm_username }}"
        ssh_password_enabled: false
        ssh_public_keys:
          - path: "/home/{{ vm_username }}/.ssh/authorized_keys"
            key_data: "{{ key_data }}"
        network_interfaces: "{{ vm_two.nic_name }}"
        image:
          offer: 0001-com-ubuntu-server-jammy
          publisher: Canonical
          sku: 22_04-lts
          version: latest

    - name: Public IP of VM
      ansible.builtin.debug:
        msg: "The public IP is {{ output_ip_address_vm_two.state.ip_address }}."

    - name: Set IP of VM
      ansible.builtin.set_fact:
        vm_two_public_ip: "{{ output_ip_address_vm_two.state.ip_address }}"


  - name: Print IPs of VMs  
    ansible.builtin.debug:
      msg: 
      - "The public IP of VM One is {{ vm_one_public_ip }}."
      - "The public IP of VM Two is {{ vm_two_public_ip }}."

```

{% endraw %}

> The key data is sensitive and should not be committed into a repo!
{: .prompt-danger }

### __3. :rocket: Run the playbook__

> LEARN: there is no inventory file because the commands all run on the localhost (the control node). 
{: .prompt-tip }

> PERMISSIONS: your service principle will need to be assigned Contributor role on the subscription you are creating the VMs in.
{: .prompt-info}

1. Export your Azure Service Principle Credentials as Variables if you have not created a configuration file as outlined in the Dependencies.

```bash
export AZURE_SUBSCRIPTION_ID=<subscription_id>
export AZURE_CLIENT_ID=<service_principal_app_id>
export AZURE_SECRET=<service_principal_password>
export AZURE_TENANT=<service_principal_tenant_id>
```

2\. Run the below commands on your control host

```bash
# Install the dependencies
ansible-galaxy collection install azure.azcollection --force 
sudo pip3 install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt

# IMPORTANT: remember to have stored or exported your Azure Service Principle Credentials

# Run the playbook
ansible-playbook  ~/create_vms_ansible/build_azure_vms.yml

```

3\. Capture the output of the playbook to find the public ip address. 

### __4. :rocket: Verify the VM exists__

Execute the below commands, ensuring you update the VM name if you changed it.

```bash
az login
# This should open up an interactive prompt

VM_ONE_NAME=myVM-1
VM_TWO_NAME=myVM-2
az vm list -d -o table --query "[?name=='$VM_ONE_NAME']"
az vm list -d -o table --query "[?name=='$VM_TWO_NAME']"
```

### __5. :rocket: Test connection__

From your control host attempt to SSH into each VM.

```bash
IP=<insert from output of Ansible>
ssh adminuser@$IP  -i ~/.ssh/id_rsa
```


## <u>Tutorial - Destroy your VMs with Ansible or Azure</u>

When you have finished your tutorial remember to destroy the VMs to reduce costs. 

- Follow the instructions in this post [Destroy target host - Azure VM]({% post_url /ansible-set-up/2025-06-07-destroy-target-host %})

> REMEMBER: update any details like the name of the RG as needed in the Ansible Playbook
