# Registration and renewal

## Prices and payment

- `check_availability` says whether names can be registered and their price; `get_price` prices
  registration or renewal for any duration. Prices depend on the name's length.
- Registration and renewal are paid in **USDC** by default, or **DAI** (`paymentToken: dai`), plus
  ETH for gas. The account needs the token balance; the prepared plan includes the token approval.
- Durations are written like `1 year`, `6 months`, `90 days` (a year is 365 days). The minimum
  registration is 28 days.

## The two steps

Registration uses commit-reveal so nobody can front-run the name:

1. **Commit** (with the token approval): a hash of the registration, without revealing the name.
2. **Wait** at least 61 seconds after the commit confirms.
3. **Register**: reveals the name and pays. It must be sent within 24 hours of the commit, or the
   commitment expires and the user starts again.

`register_name` prepares both steps at once; `get_plan_status` tells the user when step 2 can be
signed and whether it would succeed, and warns when the commitment is about to expire. The
registration can also set records and make the name the account's primary name.

## Expiry, grace period and premium

- A registered name expires at the end of its term, then enters its **grace period** (90 days for
  ENSv1 names; `get_name_details` shows the exact end): only renewing keeps it.
- After the grace period anyone can register it. For a while it carries a temporary **premium**
  that decreases to zero; `check_availability` shows it.
- Subnames do not expire on their own unless their parent sets an expiry.

## Renewal

Anyone can renew any name, while it is registered or in its grace period; renewing does not change
the owner. `renew_names` renews up to 20 names in one plan; `list_expiring_names` finds an
address's names that expire soon.
