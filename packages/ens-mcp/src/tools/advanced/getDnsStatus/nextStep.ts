/** What a DNS name's holder should do next to use it in ENS, in plain words. */
export const dnsNextStep = (status: {
  readonly name: string;
  readonly action: "none" | "claim" | "set-txt-record" | "proof-invalid";
  readonly dnsOwner: string | null;
  /** Address the TXT record should name when there is none yet. */
  readonly owner?: string | undefined;
}): string => {
  const txt = `a TXT record at _ens.${status.name} with the value a=${status.owner ?? status.dnsOwner ?? "<owner address>"}`;
  switch (status.action) {
    case "none":
      return `${status.name} is in ENS and matches its DNS records; nothing to do.`;
    case "claim":
      return `DNS names ${status.dnsOwner ?? "an owner"} as the ENS owner; claim it with claim_dns_name.`;
    case "set-txt-record":
      return (
        `Turn on DNSSEC for ${status.name} at its DNS provider and add ${txt}, then claim it ` +
        "with claim_dns_name. DNS changes can take a while to show."
      );
    default:
      return (
        `The DNSSEC proof of ${status.name} does not verify; check DNSSEC is on at its DNS ` +
        `provider and that ${txt} exists.`
      );
  }
};
