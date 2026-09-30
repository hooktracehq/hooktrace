# Security Policy

## Reporting a Vulnerability

If you believe you have found a security vulnerability in HookTrace, please report it privately.

**Do not open a public GitHub issue for security vulnerabilities.**

The preferred reporting method is GitHub's private vulnerability reporting / Security Advisories for this repository, when available.

When reporting a vulnerability, please include as much of the following information as possible:

* A clear description of the vulnerability
* The affected component, service, endpoint, or feature
* Steps to reproduce the issue
* The expected and actual behavior
* The potential security impact
* A minimal proof of concept, if available
* The affected HookTrace version, commit, or deployment configuration
* Any suggested remediation, if you have one

Please avoid including secrets, credentials, personal data, or production customer data in the report.

## What Should Be Reported?

Examples of security issues include:

* Authentication or authorization bypasses
* Exposure of webhook payloads or other sensitive data
* Credential or secret leakage
* Remote code execution
* SQL injection
* Server-side request forgery (SSRF)
* Cross-site scripting (XSS)
* Insecure webhook or tunnel handling
* Vulnerabilities that allow one user to access another user's data
* Security issues in the API, worker, dashboard, or tunnel services
* Dependency vulnerabilities that create a meaningful security risk to HookTrace

If you are unsure whether an issue is security-sensitive, please report it privately rather than opening a public issue.

## Supported Versions

HookTrace is an actively developed open-source project.

Security fixes are developed against the current `main` branch. Older commits or deployments may not receive individual security patches.

If you are running a self-hosted version, we recommend keeping your installation updated with the latest stable HookTrace release or current supported revision.

## Disclosure Policy

Please give the maintainers a reasonable opportunity to investigate and address a vulnerability before publicly disclosing the details.

After receiving a report, maintainers may:

1. Confirm receipt of the report.
2. Reproduce and assess the vulnerability.
3. Determine the affected components and versions.
4. Develop and test a fix.
5. Release the fix or otherwise communicate the remediation.
6. Publish security advisory information when appropriate.

We may coordinate disclosure timing with the reporter when additional time is needed to protect users.

We will credit security researchers who responsibly report vulnerabilities, unless they prefer to remain anonymous.

## Security Advisories

When appropriate, confirmed vulnerabilities may be disclosed through GitHub Security Advisories so that affected users can understand the impact and apply the appropriate update.

Security advisories may include affected versions, fixed versions, severity information, and remediation guidance.

## Scope

This policy applies to the HookTrace open-source repository and its maintained components, including:

* HookTrace API
* HookTrace web dashboard
* Background workers
* Webhook ingestion and delivery infrastructure
* Development tunnel services
* Officially maintained integrations
* Official deployment and configuration files

Third-party infrastructure, hosted services, dependencies, or deployments that are not maintained by the HookTrace project may fall outside the project's direct scope.

## Responsible Testing

Security testing should be performed only against systems you own or have explicit permission to test.

Do not:

* Access or modify data belonging to other users
* Disrupt production services
* Perform denial-of-service testing against public infrastructure
* Exfiltrate sensitive information beyond what is necessary to demonstrate the issue
* Publish credentials, tokens, webhook payloads, or other sensitive information

If testing requires access to a running HookTrace deployment, use your own self-hosted instance whenever possible.

## Questions

For general bugs, feature requests, and development questions, please use the normal GitHub issue and discussion channels.

Security vulnerabilities should follow the private reporting process described above.
