# Deploying and Evaluating a GoPhish Platform in an Isolated Kali Linux Lab: A Methodological Review for Defensive Phishing Awareness

**Christian Gilbert Fodé Diouf**
Full-stack developer, founder of Teranga Academy, Dakar, Senegal
Contact: christiandiouf23@gmail.com · GitHub: [github.com/cjr23](https://github.com/cjr23)

**Version 2.0, November 2026**

[Version française](README.md) · [PDF (English)](Review_GoPhish_Kali_Linux_Christian_Gilbert_Fode_Diouf_EN.pdf) · [Online version](https://cjr23.github.io/gophish-kali-linux-guide/en/) · [How to cite](#how-to-cite-this-work) · Licence [CC BY 4.0](LICENSE)

---

## Abstract

Phishing is still one of the most common and most costly ways into an information system, and it works by exploiting people rather than software flaws. Awareness training built on controlled simulations is a recognised countermeasure. This paper presents a methodological review and a reproducible protocol for deploying GoPhish, an open-source phishing simulation framework, in a strictly isolated lab on a virtualised Kali Linux system. We describe the experimental setup, the installation and hardening steps (every listener is bound to the loopback interface), how to check that the platform works, and a protocol for assessing what learners have acquired. The ethical and legal framework comes first, because it governs any use of this kind of tool: isolation, explicit authorisation, fictitious data, and no collection of real secrets. Our results show that such an environment can be set up reliably and used for teaching without any exposure to the production network. We conclude that a simulation exercise should be judged by how much participants learn, not by how many credentials it captures.

**Keywords:** phishing; social engineering; security awareness; GoPhish; Kali Linux; isolated lab; defensive cybersecurity; reproducibility.

---

## 1. Introduction

### 1.1 Background and motivation

Social engineering, and phishing in particular, gets around technical defences by going after human decisions. A software vulnerability can be fixed with a patch. Susceptibility to phishing cannot: it only goes down through learning, practice and repetition. This is why controlled phishing simulations have become a normal part of awareness programmes. They make it possible to measure click rates, find the groups most at risk, and follow the effect of training over time.

These tools also carry the dual-use problem that runs through cybersecurity. A framework built to *teach* can just as easily be used to *deceive*. Any experimental work with them therefore needs a strict protocol, isolation from the production network, and written authorisation.

### 1.2 Aim and contributions

This paper is an applied methodological review, not an offensive study. It sets out a reproducible lab protocol for teaching defensive security. Its contributions are:

1. a reproducible installation protocol for GoPhish on virtualised Kali Linux, documented step by step;
2. a hardening procedure that binds every service to the loopback interface (`127.0.0.1`), so nothing is exposed on the network;
3. a verification method based on inspecting listening ports and querying the service;
4. an explicit ethical and legal framework, treated as a precondition rather than an appendix;
5. an assessment protocol for checking whether the teaching objectives were met.

### 1.3 Learning objectives

By the end of the protocol, the learner should be able to:

- check the hardware architecture and network configuration of a Kali Linux system;
- download GoPhish from its official source and extract the archive;
- configure the services so they can only be reached locally;
- start the platform and open its administration interface;
- identify the main sections of the interface;
- explain the risks of phishing and the habits that help prevent it.

---

## 2. Ethical and legal framework (binding prerequisite)

> **Core rule.** This work covers only a lab installation and defensive awareness. GoPhish must never be used to deceive people, collect credentials or send messages without **written authorisation** and a **clearly defined scope**.

Each principle below is a condition of validity for the whole protocol, scientific as much as legal:

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | Use only test accounts and fictitious data | No real personal data is processed |
| 2 | Never ask for or store real passwords | An exercise must not produce any usable secret |
| 3 | Keep the administration interface on `127.0.0.1` | Nobody can reach the console remotely |
| 4 | Do not expose the server to the Internet or to the institution's network | The experiment stays inside the lab |
| 5 | Do not set up port forwarding on the router | Nothing goes online by accident |
| 6 | Never publish secrets (passwords, keys, database, configuration) in a public repository | Sensitive information cannot leak |
| 7 | Get explicit approval from the lab supervisor before any exercise involving other people | This is what makes the exercise lawful |

All of these rules follow from one idea, risk minimisation: the environment has to be isolated, documented and used with permission.

---

## 3. Materials and methods

### 3.1 Experimental setup

The reference environment is Kali Linux running in VirtualBox, with the network in NAT mode. NAT isolates the virtual machine from the physical network by design, so you should not expect physical devices to be visible from inside the VM. The values below were recorded on the demonstration machine and may be different on yours.

| Item | Observed value |
|------|----------------|
| System | Kali Linux on VirtualBox |
| Network interface | `eth0` |
| Machine IPv4 address | `10.0.2.15` |
| Virtual network | `10.0.2.0/24` |
| NAT gateway | `10.0.2.2` |
| GoPhish administration | `https://127.0.0.1:3333` |
| Recommended local demo port | `127.0.0.1:8080` |

### 3.2 Software

- GoPhish, the open-source campaign simulation framework, distributed as a binary archive for Linux ([official repository](https://github.com/gophish/gophish)).
- Standard system utilities: `wget`, `unzip` and `curl`, plus the usual network inspection tools (`ip`, `ss`).

### 3.3 Reproducibility

The procedure starts from a standard Kali installation. Every step comes with the exact commands and the expected result, so anyone can check the observations independently.

---

## 4. Experimental procedure

### 4.1 Preparing the system

Update the package list:

```bash
sudo apt update
```

Install the required utilities:

```bash
sudo apt install wget unzip curl -y
```

Check the hardware architecture:

```bash
uname -m
```

For a 64-bit x86 Linux archive, the output is usually:

```
x86_64
```

Show the network configuration:

```bash
ip route
```

In the demonstration environment, the route shows the address `10.0.2.15` and the network `10.0.2.0/24`.

### 4.2 Downloading and extracting GoPhish

Download the Linux build that matches the machine's architecture from the project's official releases page, and stick to files published by the project itself:

> Official page: <https://github.com/gophish/gophish/releases>

Example commands, assuming the `v0.12.1` archive is in `Downloads`:

```bash
cd ~/Downloads
ls -lh gophish*.zip
unzip gophish-v0.12.1-linux-64bit.zip -d ~/gophish
cd ~/gophish
ls -lh
```

After extraction, the folder should contain the `gophish` executable, the `config.json` file and the program's resource directories.

> **Archive not found?** `unzip` needs the exact name of the archive. Check where it is with `ls -lh ~/Downloads`. If the name or version is different, change the command to match the file you actually downloaded.

### 4.3 Hardening: binding the services to the local interface

Before the first start, restrict the services to the local machine. Open the configuration file:

```bash
cd ~/gophish
nano config.json
```

In the `admin_server` section, the administration listen address must be:

```json
"listen_url": "127.0.0.1:3333"
```

In the `phish_server` section, for a strictly local demonstration, use an unprivileged port, for example:

```json
"listen_url": "127.0.0.1:8080"
```

In `nano`, save with `Ctrl + O`, confirm with `Enter`, then quit with `Ctrl + X`.

> **Careful with the file.** Change only these two values inside the full JSON file; do not replace the whole file with the two lines above. Check the syntax (commas, quotes). The demonstration server must not listen on `0.0.0.0` or on any interface reachable from the Internet.

### 4.4 First start and login

From the GoPhish folder:

```bash
cd ~/gophish
chmod +x gophish
./gophish
```

On first start, the terminal may print an initial password generated for the `admin` account. Use the password printed by the instance you actually launched.

> The initial password is **confidential**. It must not appear in any document, public screenshot or public repository.

Open the interface in Firefox:

```
https://127.0.0.1:3333
```

Log in with the username `admin` and the initial password, then replace the temporary password straight away with a unique, strong one. The browser may warn about a self-signed certificate for the local interface; check that the address shown is `127.0.0.1`.

> **Keep the terminal open.** GoPhish runs in the foreground, so the terminal has to stay open. To stop it cleanly at the end of the session, go back to that terminal and press `Ctrl + C`.

---

## 5. Results: functional overview and verification

### 5.1 The administration interface

The interface is split into several sections. Their exact names may vary slightly from one version to another.

| Section | What it is for |
|---------|----------------|
| Dashboard | Overview of activity and statistics |
| Campaigns | Tracking authorised simulations |
| Users & Groups | Managing test users and authorised groups |
| Email Templates | Managing the message templates used in exercises |
| Landing Pages | Demonstration and learning pages |
| Sending Profiles | Technical sending settings; never use them to contact anyone without authorisation |

### 5.2 Checking that it works

In a second terminal, look at the listening ports:

```bash
sudo ss -lntp | grep -E ':3333|:8080|:80'
```

Query the local administration interface:

```bash
curl -k -I https://127.0.0.1:3333
```

An HTTP response means the service is up. If port `80` shows up while the local configuration expects `8080`, stop GoPhish and check the `phish_server` value in `config.json`. What you should see is that only ports bound to `127.0.0.1` respond, which confirms that nothing is exposed on the network.

---

## 6. Discussion: troubleshooting

These are the problems we ran into most often, and how to diagnose them.

| Problem | Check or fix |
|---------|--------------|
| ZIP archive not found | Check the folder with `ls -lh ~/Downloads` and use the exact file name |
| The `gophish` folder is empty | Run `unzip` again with the full path to the archive |
| Page `3333` does not load | Check that GoPhish is running and that `admin_server` listens on `127.0.0.1:3333` |
| Password rejected | Check the password printed by the instance and the `admin` account; do not publish the secret |
| Port already in use | Find the process with `sudo ss -lntp` and pick another free local port |
| Slow interface | Test with `curl -k -I https://127.0.0.1:3333` and read the messages in the terminal |

Most of these come down to two causes. Either the archive name does not match the command, or the network configuration is inconsistent. The checks in section 5.2 catch both, which is a good reason to verify at every step rather than at the end.

---

## 7. Learning assessment

### 7.1 Practical exercises

The following exercises are done in the local lab:

1. Display the architecture with `uname -m` and explain the result.
2. Display the network route with `ip route` and find the machine's IP address.
3. Find the GoPhish archive and check its name with `ls`.
4. Explain why the administration interface must listen on `127.0.0.1`.
5. Open the dashboard in Firefox.
6. Name at least four sections of the interface and explain what they do.
7. List five signs that help spot a phishing message.

### 7.2 Review questions

- What is GoPhish used for in an awareness programme?
- What is the difference between `127.0.0.1` and `0.0.0.0`?
- Why should real passwords never be recorded during a simulation?
- Which command shows the listening ports?

---

## 8. Limitations

The network values reported here belong to one VirtualBox/NAT setup. They will not carry over to another environment without adjustment.

The scope is deliberately defensive. The protocol stops once the platform is installed and the interface has been explored. Running actual campaigns is a different matter, with its own organisational and legal framework, and it is not covered here.

Finally, the assessment measures procedural knowledge. Whether this kind of training lowers phishing susceptibility over the long run is a separate question that this work does not try to answer.

---

## 9. Conclusion and future work

We have presented a reproducible protocol for deploying GoPhish in an isolated Kali Linux environment, together with a hardening procedure, a verification method and a binding ethical framework. The resulting environment is reliable, documented and usable for teaching, with no exposure to the production network.

What comes next should stay focused on prevention: recognising suspicious messages, understanding how social engineering works, and getting into the habit of reporting. The principle behind this whole work fits in one sentence:

> A successful awareness exercise is measured by what participants learn and by their ability to avoid the traps, never by the secrets collected from them.

Future work could track susceptibility rates over time, compare different training formats, and look at how repeated simulations affect what people remember months later.

---

## References

1. GoPhish, official project repository. <https://github.com/gophish/gophish>
2. GoPhish, published releases. <https://github.com/gophish/gophish/releases>
3. GoPhish, project documentation. <https://docs.getgophish.com/>
4. Kali Linux, official documentation. <https://www.kali.org/docs/>
5. Oracle VM VirtualBox, User Manual, chapter "Network Address Translation (NAT)". <https://www.virtualbox.org/manual/>

---

## How to cite this work

**APA:**

Diouf, C. G. F. (2026). *Deploying and evaluating a GoPhish platform in an isolated Kali Linux lab: A methodological review for defensive phishing awareness* (Version 2.0). Teranga Academy. https://cjr23.github.io/gophish-kali-linux-guide/en/

**BibTeX:**

```bibtex
@techreport{diouf2026gophish_en,
  author      = {Diouf, Christian Gilbert Fodé},
  title       = {Deploying and Evaluating a GoPhish Platform in an Isolated Kali Linux Lab: A Methodological Review for Defensive Phishing Awareness},
  institution = {Teranga Academy},
  address     = {Dakar, Senegal},
  type        = {Methodological review},
  number      = {Version 2.0},
  year        = {2026},
  month       = nov,
  language    = {english},
  note        = {English version of the original French paper},
  url         = {https://cjr23.github.io/gophish-kali-linux-guide/en/}
}
```

---

## Disclaimer

This document is defensive teaching material. It describes how to set up an isolated lab environment. Using GoPhish outside an authorised, documented scope agreed to in writing may be a criminal offence. The author accepts no liability for misuse.

---

*© 2026 Christian Gilbert Fodé Diouf. Distributed for educational purposes.*
