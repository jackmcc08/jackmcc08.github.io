---
layout: post
title: Ansible Part 3 - Run Ansible from an Azure DevOps Pipeline
description: Integrate Ansible into your CI/CD workflow
date: 2025-08-12 22:00 +0100
categories: [Ansible]
tags: [Ansible, Automation, Azure, Pipelines, DevOps]
comments: true
---

{% include medium_xpost.md url="https://medium.com/@jackmcc08/run-ansible-from-an-azure-devops-pipeline-1c8b6f754de1" %}

## <u>What's included in this tutorial?</u>

In this tutorial, you will write an Azure DevOps pipeline to execute Ansible on target VMs in Azure.

Key topics:
- Create a basic Azure Devops pipeline to execute an Ansible Playbook
- Securely store the VM connection key in an Azure Key Vault
- Create a self hosted pipeline agent in Azure

> In this tutorial we will be using a **self hosted pipeline agent**. This can be used to connect into private networks. The alternative is to use the Microsoft Hosted Agent, but at the time of writing free devops projects have to request access to the free agent, and this takes some time to setup.
{: .prompt-tip}


## <u>Dependencies</u>
- This tutorial requires the following:
    - A linux virtual machine (self-hosted-agent-vm) in Azure to act as the self hosted agent.
    - A linux virtual machine (target-vm) in Azure to act as the target host.
    - Ensure you have access to the private SSH keys for both VMs - this will be stored in a key vault.
    - You can follow the steps in this blog to help you get prepared. [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})
        - by following step 0.5 you can create the two VMs you require for this tutorial.

    - An Azure DevOps organisation and project
        - [Guide to create an organisation](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops){:target="_blank"}
        - [Guide to create a project](https://learn.microsoft.com/en-us/azure/devops/organizations/projects/create-project?view=azure-devops&tabs=browser){:target="_blank"}

    - Correct Role to create Service Principals on Microsoft Entra

## <u>Tutorial</u>

For this tutorial we are going to:
1. Create a Service Principal
2. Set the Service Principle up in DevOps with the correct permissions
3. Create your self-hosted DevOps Agent
4. Create a repo in DevOps
5. Create your Ansible Playbook and Inventory
6. Store your SSH key in Azure Key Vault
7. Create your pipeline
8. Run the pipeline and see Ansible work in DevOps!

### :rocket: __Step 1 - Create a Service Principal__

This Service Principal will be used to:
- Connect to the Azure Subscription
- Pull secrets from the Key Vault
- Authorise the self-hosted agent (Optional)

> For simplicity we are using one service principal here, but in production it is more secure to use multiple service principals for each function and ensure you are only assigning the lowest level of privilege needed. It is also possible to use Managed Identities and other authentication solutions but for simplicity we will use service principals.
{: .prompt-tip}

Create a Service Principal using this [Microsoft guide](https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-service-principal-portal#register-an-application-with-microsoft-entra-id-and-create-a-service-principal){:target="_blank"}. Steps summarised below:

1. Browse to [Microsoft Entra](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade/quickStartType~/null/sourceType/Microsoft_AAD_IAM){:target="_blank"}
    - you can also click through to it from the Azure Portal.
2. Click on App Registrations
3. Click on New Registrations
4. Give application a name
    - for this tutorial I am using the name `ansible-azure-devops-pipeline`
5. Supported Account types should be from this org only
6. No redirect URI necessary.
7. Click Register

Now create a `client secret` and get the relevant details
1. For the created App Registration click on Certificates & Secrets.
2. Click create new client secret, give it a name and an expiry date
3. __SAVE__ the secret value in a secure area
4. Now click on `Overview` in the right hand blade and record several key details (see below).

You should have the below information to hand for the rest of the tutorial:
- Display Name
- Application (Client) ID
- Object ID
- Tenant ID
- Client Secret Value

### :rocket: __Step 2 - Set the Service Principle up as a DevOps User, Grant Access to the Default Agent Pool, and set up a Serivce Connection__

This will be used to authorise the self hosted agents.

1. Connect your `Microsft Entra ID` to the DevOps project.
    - Use the steps in this [guide](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops#connect-your-organization-to-microsoft-entra-id-1){:target="_blank"}

2. Add your `service principal` as a `user` into your organisation.
    - NOTE this is at the `organisation level` not the project level.
    - Follow Step 2 only of this [guide](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/service-principal-managed-identity?view=azure-devops#step-2-add-the-identity-to-azure-devops){:target="_blank"}
        - Add the SP as a user to your project
        - Add the SP to the Project Administrators group

3. Give your SP authorisation over the `Default Agent Pool`.
    - Follow this [guide](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/service-principal-agent-registration?view=azure-devops){:target="_blank"}
    - NOTE: this needs to be at the organisation level not the project level!
    - Select the `Default` Agent Pool 
    - Set the SP as an Administrator
    - Don't forget to click `save`

4. Create a DevOps Service Connection using your existing Service Principle Credentials
    - Go to your DevOps Project
    - Click on Project Settings
    - Click on Service Connections (under Pipelines)
    - Click Create Service Connection 
    - Select Azure Resource Manager
    - Select following options

    ```txt
    - Type: App Registration (Manual)
    - Credential: Secret
    - Environment: Azure Cloud
    - Scope: Subscription
    - Subscription ID: <insert-subscription-ID>
    - Subscription Name: <insert-subscription-name>
    - Application ID: <insert-sp-client-app-id>
    - Tenant ID: <insert-tenant-id>
    - Credential: Service Principal Key
    - Client Secret: <insert-client-secret>
    - Service Connection Name: mySvcConnection
    - Security: tick grant access permission to all pipelines
    ```

    - Click verify & save


### :rocket: __Step 3 - Create a Self Hosted Agent__

1. Download the agent config
    - Follow this [Microsoft Guide](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux-agent?view=azure-devops&tabs=IP-V4#download-and-configure-the-agent){:target="_blank"}
    - Use the Default Pool
    - Linux, x64

2. Copy the downloaded zip file from the first step to your self-hosted agent vm.

    ```bash
    scp -i <path to ssh key> <path to downloaded zip file> <username>@<public-ip-self-hosted-agent-vm>:~/
    ```

3. Connect via SSH to your self-hosted-agent-vm from your local machine
    - `ssh <username>@<public-ip-self-hosted-agent-vm>`

4. Run the commands as per the agent config guide:
    - Enter the following key information

    ```txt
    - Azure DevOps URL = `https://dev.azure.com/{your-organization}`
    - Authentication type = sp
    - Client (App) ID = `<your-service-principal-id>`
    - Tenant Id = `<your-tenant-id>`
    - Client Secret = `<your-service-principal-key>`
    - agent pool = `default`
    - agent name = `mySelfHostedAgent` # you can enter your own name
    - work folder = `_work`
    ```

    ```bash
    mkdir myagent && cd myagent
    tar zxvf <path to copied over zip file>

    ./config.sh
    # Enter information
    ```

5. Set up the agent as a service so that it runs and starts on VM restart
    - [Microsoft Guide](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux-agent?view=azure-devops&tabs=IP-V4#run-as-a-systemd-service){:target="_blank"}

    ```bash
    cd ~/myagent

    sudo ./svc.sh install <username>

    sudo ./svc.sh start
    ```

6. (Optional) Secure the network 
    - [Firewall requirements](https://learn.microsoft.com/en-us/azure/devops/organizations/security/allow-list-ip-url?view=azure-devops&tabs=IP-V4){:target="_blank"}
    - Set up inbound rule:

    ```txt
    - Name: AllowTagCustomAnyInbound
    - Priority: 1010
    - Port: 443
    - Protocol: TCP
    - Source: AzureDevOps (ServiceTag)
    - Destination: Any
    ```

    - Set up two outbound rules (one for IPV4 and one for IPV6)

    ```txt
    - Name: AllowAzureDevOpsHTTPSOutbound
    - Priority: 1020
    - Port: 443
    - Protocol: TCP
    - Source: Any
    - Destination: [IP addresses in Outbound Connections in this section](https://learn.microsoft.com/en-us/azure/devops/organizations/security/allow-list-ip-url?view=azure-devops&tabs=IP-V6#outbound-connections){:target="_blank"}
    ```

7. Validate the agent is connected
    - Click on Azure DevOps
    - Project Settings
    - Agent Pools
    - Agents
    - You should see the self hosted agent listed as being online (with a green circle next to it)

### :rocket: __Step 4 - Create a new repo in your DevOps Project and Clone to your Machine__

- Create a new Repo
    - [Microsoft Guide](https://learn.microsoft.com/en-us/azure/devops/repos/git/create-new-repo?view=azure-devops){:target="_blank"}
    - Go to repos
    - Click on drop down repo names at the top
    - Click on new repository
    - Enter name - `ansible-devops-pipeline`
    - Click Create

- Clone to your machine
    - [Guide](https://learn.microsoft.com/en-us/azure/devops/repos/git/create-new-repo?view=azure-devops#clone-the-repo-to-your-computer){:target="_blank"}

```bash
git clone ~/<repo-http-address>
# It should create a folder called ansible-devops-pipeline

```

- Open the repo in vscode or a editor/IDE of your choice

### :rocket: __Step 5 - Create your Ansible Playbook__

The below ansible playbook installs Nginx on the target host. The below instructions assume you are using vscode

1. Create a folder called `playbooks`

2. Create a file called `myPlaybook.yml`

3. Add the following content into the playbook
  - [Playbook Code Snippet](https://github.com/jackmcc08/learn-ansible/blob/main/3_Ansible_Devops_Pipelines/playbooks/myPlaybook.yml){:target="_blank"}

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

### :rocket: __Step 6 - Create your Ansible Inventory__

1. Create a file called `myInventory.yml`

2. Add the following content into the inventory:
  - [Inventory Code Snippet](https://github.com/jackmcc08/learn-ansible/blob/main/3_Ansible_Devops_Pipelines/myInventory.yml){:target="_blank"}


```yaml
---

test_group:
  hosts:
    node1:
      ansible_host: <Insert IP Address of the target VPN>
  vars:
    ansible_ssh_private_key_file: ~/.ssh/id_rsa <this will be replaced in the pipeline>
    ansible_user: adminuser
    ansible_python_interpreter: /usr/bin/python3

```

> SSH Private Key File: one issue when automating is ensuring that credentials are properly secured. In the next step, when we build pipeline, we will download the private key from a key vault and store it in a temporary file while it is being used. After the pipeline is run it will be cleaned up.
{: .prompt-warning}

> Dynamic Inventories: With cloud
{: .prompt-tip}

### :rocket: __Step 7 - Store the SSH Private Key in an Azure Key Vault__

1. Create a keyvault if you don't have one.
    - [Microsoft Guide](https://learn.microsoft.com/en-us/azure/key-vault/general/quick-create-portal){:target="_blank"}
    - name: myKeyVault-<insert-name>
    - location: <insert-location>
    - permission model: azure role based access
    - networks: All networks (for simplicity)

2. Assign access policies to the key vault.
   - [Microsoft Guide](https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy-portal){:target="_blank"}
   - Assign the service principle `Key Vault Secrets User`
   - Assign yourself `Key Vault Secrets Officer`

3. Create a secret via the az cli:
    - upload the secret via az cli to preserve the formatting of the key file, otherwise copying it in manually can cause formatting issues.

    ```bash
    az login
    az keyvault secret set --vault-name <insert-keyvault-name> --name myPrivateKey --file "<path-to-your-private-ssh-key>" --encoding ascii
    ```

    

### :rocket: __Step 8 - Create your pipeline__

1. Create a file called `myPipeline.yml`

2. Add the following content into the pipeline, insert the following info:
    - self-hosted agent name
    - service principal (SP) service connection name
    - key vault name
    - private key secret name
    - [Pipeline Code Snippet - Template](https://github.com/jackmcc08/learn-ansible/blob/main/3_Ansible_Devops_Pipelines/myPipeline.yml){:target="_blank"}
    - [Pipeline Code Snippet - Completed Example](https://github.com/jackmcc08/learn-ansible/blob/main/3_Ansible_Devops_Pipelines/myPipeline_complete_example.yml){:target="_blank"}


```yaml
---

name: Ansible Playbook Pipeline

# This section controls the triggering of the pipeline, it is set to be manually triggered only
trigger:
- none

# This section specifies the self-hosted agent pool to use
pool:
  name: Default
  demands: Agent.Name -equals <insert-your-agent-name>

steps:
- checkout: self
  displayName: 'Checkout source code'

# This sets up the Ansible dependencies for each run of the pipeline
- task: Bash@3
  displayName: 'Install Ansible Dependencies'
  inputs:
    targetType: 'inline'
    script: |
      set -e

      echo "Setting up Ansible"

      sudo apt update
      sudo apt install python3 -y

      sudo apt install -y \
      python3-pip \
      python3-venv

      echo -e "\nCreating python virtual environment - ansible-env"
      python3 -m venv ansible-env

      echo -e "\nActivating venv - ansible-env"
      source ansible-env/bin/activate

      echo -e "\nInstalling ansible-core"
      pip install ansible-core --upgrade

      echo -e "\nExporting PATH to include local bin"
      export PATH=~/.local/bin:$PATH
      
      echo -e "\nAnsible Version"
      ansible --version

      # The below code will install collections and python requirements defined in file, for this tutorial we do not use them, but they are there for reference.
      if [ -s "./ansible-requirements.yml" ]; then
        echo "Installing Ansible Galaxy requirements from ansible-requirements.yml"
        ansible-galaxy install -r ./ansible-requirements.yml
      fi

      if [ -s "./python-requirements.txt" ]; then
        echo -e "\nInstalling Python requirements"
        pip install -r ./python-requirements.txt
      fi

      echo -e "\Deactivating venv - ansible-env"
      deactivate
    workingDirectory: '$(System.DefaultWorkingDirectory)'

# https://learn.microsoft.com/en-us/azure/devops/pipelines/release/azure-key-vault?view=azure-devops&tabs=managedidentity%2Cyaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: <Insert SP Service Connection Name> # string. Alias: ConnectedServiceName. Required. Azure subscription. 
    KeyVaultName: <insert key vault name> # string. Required. Key vault. 
    SecretsFilter: <insert secret name> # string. Required. Secrets filter. Default: *.
    RunAsPreJob: false # boolean. Make secrets available to whole job. Default: false.

- task: Bash@3
  displayName: 'Save SSH key in a temp file'
  env:
   PRIVATE_KEY: "$(<Insert secret name>)"
  inputs:
    targetType: 'inline'
    script: |
        echo "$PRIVATE_KEY" > /tmp/azure_vm_id_rsa
        chmod 600 /tmp/azure_vm_id_rsa
    workingDirectory: '$(System.DefaultWorkingDirectory)'


# NOTE 1: this will override the key file path for all target hosts, if you want to be more specific you will need to alter the individual hostvars or predefine the paths.
# NOTE 2: we disable host key checking here as the agent is running in a non-interactive mode
- task: Bash@3
  displayName: 'Execute Ansible Playbook to configure target VM'
  env:
    ANSIBLE_HOST_KEY_CHECKING: False
  inputs:
    targetType: 'inline'
    script: |
      set -e
      source ansible-env/bin/activate
      ansible-playbook -i myInventory.yml playbooks/myPlaybook.yml -e "ansible_ssh_private_key_file=/tmp/azure_vm_id_rsa"
      deactivate
    workingDirectory: '$(System.DefaultWorkingDirectory)'

- task: Bash@3
  displayName: 'Remove SSH key'
  condition: always()
  inputs:
    targetType: 'inline'
    script: |
      rm -f /tmp/azure_vm_id_rsa
    workingDirectory: '$(System.DefaultWorkingDirectory)'
```


3. Commit and push your code up to your DevOps project. (For this demo if you are just using main it is not an issue, but otherwise remember to follow good branching and pull request strategies)


### :rocket: __Step 9 - Create and Run your pipeline in Azure DevOps__

1. Go to your DevOps Project

2. Click on Pipelines

3. Click on Create Pipeline

4. Select Azure Repos Git

5. Select your repository with your pipeline code

6. Select `Existing Azure Pipelines YAML file`

7. Select the YAML file you created earlier (e.g., `myPipeline.yml`) in the dropdown box for Path

8. Click Create

9. Click Run

10. The DevOps Screen should change to show the pipeline run

11. Click on Job with status Waiting, you will need to approve it.

12. Click on View

13. Click on Permit, then Permit again when the access request pops up

14. Let the pipeline run

15. Once its complete, you should now be able to enter the Public ip address of the VM and get the Nginx homepage!
    - This is over port 80 as there is no TLS certificate.

### :rocket: __Step 10 - Clean up your resources__

- Go and delete any VMs you created for the lesson - see section 4 of [Preparing for Ansible]({% post_url /ansible-set-up/2025-06-07-prepare-ansible-part0 %})
- If you have exposed any VMs on the public internet, then consider removing the connection if it is no longer required.
- Delete your devops organisation and project (if you created them for this tutorial)
- If keeping your devops organisation/project, then consider removing the service credentials and self-hosted agents if they are no longer required.
- Delete any unused Service Principals.



## Next Steps
- [Code Snippets](https://github.com/jackmcc08/learn-ansible/tree/main/3_Ansible_Devops_Pipelines){:target="_blank"}
- Next tutorial coming soon...
