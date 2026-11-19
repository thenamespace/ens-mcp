# Security policy

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/thenamespace/ens-mcp/security/advisories/new)
to report suspected vulnerabilities. Do not open a public issue or pull request with exploit details
before a fix is available.

Include the affected version or the hosted server, the transport (stdio or HTTP), a minimal
reproduction, expected and observed behavior, and the potential impact. Redact private keys, API
credentials and authenticated RPC URLs.

Reproduce issues locally or against a server you run. Do not disrupt the hosted server or other
public infrastructure, or access data that is not yours.

## Supported versions

Security fixes target the latest release of `@thenamespace/ens-mcp` and the hosted server. Older
releases and prereleases do not receive guaranteed backports.

## Scope

Reports about tool input handling, prompt injection through ENS data (records, profiles and other
text a tool returns to an assistant), the HTTP transport, authentication, request forwarding to
RPCs and indexers, dependency integrity and package publishing are welcome. Documentation that
causes unsafe use is also in scope.

ens-mcp integrates ENS contracts, RPCs, indexers and MCP clients. Those systems have their own
security boundaries. Report suspected ens-mcp integration flaws here even when an external service
is involved; vulnerabilities solely in another project should be reported through that project's
private security channel.

## Disclosure

The maintainer will investigate privately and coordinate remediation and disclosure with the
reporter. Accepted reports may result in a GitHub security advisory and patched release. This policy
does not promise a response deadline, audit coverage, or a bounty.
