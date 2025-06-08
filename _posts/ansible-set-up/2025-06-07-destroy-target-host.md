---
layout: post
title: Ansible Part 0.4 - Destroy target host
description: Preparing your environment to start using Ansible
date: 2025-06-07 08:15 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure]  
comments: true
---

[Return to index]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})

## <u>Destroy Target Host - remove Azure VM</u>

This tutorial covers cleaning up the Target Hosts created in earlier steps in this tutorial. 

You will want to remove the VM to stop incurring costs from your cloud provider and ensure there are no more exposed endpoints.

The Ansible Code will be run on your Control Host and you will need a personal Azure Subscription with some credit in it. 

> This tutorial is based on this [Microsoft Guide](https://learn.microsoft.com/en-us/azure/developer/ansible/vm-configure?tabs=ansible)

## <u>Dependencies</u>
- If you have followed the previous tutorials then you will have all the required dependencies
- A control host to run the Ansible Commands
- A service principle for your Azure Subscription. See the previous part 0.2 and follow the guidance there.
  - If you have not [stored](https://learn.microsoft.com/en-us/azure/developer/ansible/install-on-linux-vm?tabs=azure-cli#create-azure-credentials) the service principle details and secrets for consumption by Ansible then you will need to export them as variables in Step 2.

## <u>Tutorial using Azure Portal to Destroy VM</u>

1. Login into Azure

2. Navigate to your Resource Group 

3. Click Delete in the Resource Group overview tab. 

4. You will need to confirm deletion.

5. This will remove all resources in that Resource Group

## <u>Tutorial using Ansible to Destroy VM</u>

### __1. :rocket: Create the playbook delete_rg.yml__

Create the playbook to remove the VM

```bash
nano  ~/create_vm_ansible/delete_rg.yml
```

Copy the below playbook and update the `name` variable on line 4
- [Gist Code Snippet](https://gist.github.com/jackmcc08/be6b64b2608ac14ac2eb8c8a8c47e25f#file-destroy_azure_vm_ansible-yml)

{% raw %}

```yaml
---
- hosts: localhost
  vars:
    name: learnAnsibleRG
  tasks:
    - name: Deleting resource group - "{{ name }}"
      azure.azcollection.azure_rm_resourcegroup:
        name: "{{ name }}"
        state: absent
        force_delete_nonempty: true
      register: rg
    - name: Print Resource Group Deletion Output
      ansible.builtin.debug:
        var: rg
```
{% endraw %}

> LEARN: you can override defined variables in several ways, including on the command line. See the guide on variable precedence to understand how to do this: [Link](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#understanding-variable-precedence)
{: .prompt-tip }

### __2. :rocket: Run the playbook__

1. Export your Azure Service Principle Credentials as Variables if you have not created a configuration file as outlined in the Dependencies. 

```bash
export AZURE_SUBSCRIPTION_ID=<subscription_id>
export AZURE_CLIENT_ID=<service_principal_app_id>
export AZURE_SECRET=<service_principal_password>
export AZURE_TENANT=<service_principal_tenant_id>
```

2\. Run the below command on your control host.

You can also override the name variable in the playbook using the --extra-vars flag. Try it out.

```bash
# If you want to use extra vars include the --extra-vars command
RG_NAME=learnAnsibleRG
ansible-playbook ~/create_vm_ansible/delete_rg.yml --extra-vars "name=$RG_NAME"
```