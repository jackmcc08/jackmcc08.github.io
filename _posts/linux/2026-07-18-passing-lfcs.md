---
layout: post
title: Passing the LFCS - Linux Foundation Certified System Administrator 
description: Start using Linux, and get qualified
date: 2026-07-18 09:00 +0100
categories: [Linux]
tags: [Linux, Certification]  
comments: true
---

I recently passed the LFCS exam and became a "qualified" sysadmin. While I don't believe certifications are essential to your career and they certainly don't make you a good engineer. I do believe that they help chart your progress and match theory with practical skills.

In my previous job I worked for a client building an edge computing linux setup which allowed me to go deep into setting up linux servers and automation (See my posts on using Ansible). This was a great experience and opened my eyes to a lot of the underlying server engineering that underpins our technology. So having spent a year+ hands on with Linux I thought I had better learn some theory and thats where the LFCS comes in. 

Working through the course reinforced a lot of material I had used in my work, and was actually just generally enjoyable learning new things in the linux world. A couple of the challenges I talk about below were especially fun. 

## <u>What is the LFCS?</u>

The LFCS is the Linux Foundations Linux Foundation Certified System Administrator exam. [Link](https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/)

The Linux Foundation provides a neutral, trusted home for developers to collaborate on open software projects, and they provide numerous certificates for people to learn such as the CKA (Certified Kubernetes Administrator exam). The LFCS is the foundation's standard linux administrator exam and is intended to teach basic to intermediate linux skills. 

The materials are very broad and they do not go particularly deep into any specific issue, but you will be required to learn a little bit of everything for this exam. 


## <u>Is this certification for you?</u>

Why do this certificate: 
- You work in tech and want a deeper understanding of key server technology. 
- You have a lot of linux experience and want to recognize that with a cert. 
- You like using the command line/terminal.
- You want to gain a bit more of a fundamental understanding of servers.

If you are going to do it, wait for a deal from the Linux Foundation as the course is quite expensive.

## <u>How did I prepare?</u>

My key advice to prepare is to just practice using linux, boot your computer with it or get access to a VM or another server. There is no substitute for hands on time. 

My initial preparation was to take the [LFS207 Course](https://training.linuxfoundation.org/training/linux-system-administration-essentials-lfs207/) which is the accompanying course for the cert. This is quite long but covers all the key materials for the course.
> TIP: is to work through all of the challenges/questions as time spent in the terminal will help massively. 

I then did as many practice exams & challenges as I could: 
- [killer.sh](https://killer.sh/) - you get two practice exams though your course purchase - use these wisely - they are the same exam. 
- kodekloud - has a bunch of linux courses (and is generally a good site for cloud/platform engineering), I did the following: 
  - [linux challenges](https://kodekloud.com/courses/linux-challenges)
  - [linux labs](https://kodekloud.com/studio/labs/linux)
- OverTheWire - [Bandit](https://overthewire.org/wargames/bandit/) - this is actually a hacking game but working through the challenges helps you get really familiar with the command line and if you have an interest in cybersecurity is a really fascinating game.


## <u>How was the exam</u>

The exam covered a lot of different areas. It had around 17 questions and you need to keep your pace up otherwise you will run out of time. 

The exam questions are pretty much exclusively resolved through the `terminal`, so you need to be familiar with using it.

You also do not have access to any docs or materials except for `man` and `tldr` and `--help` commands. So you need to get comfortable with using these tools in the terminal. 

> Top Tip - learn how to search through man docs and to iterate through searches. This will help you quickly find the right commands you need. 

The area that I felt I was most unprepared on was the use of iptables. 