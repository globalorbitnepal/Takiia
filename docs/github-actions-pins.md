# GitHub Actions SHA pins

Third-party actions are pinned to **full commit SHAs** (not floating tags) in workflows.

## Verification method

For each tag, the commit SHA was resolved with the GitHub Git API (read-only):

```text
GET https://api.github.com/repos/{owner}/{repo}/git/refs/tags/{tag}
→ object.sha
```

Verified on the local preparation machine (no secrets involved):

| Action                | Tag      | Pinned SHA                                 | API verified |
| --------------------- | -------- | ------------------------------------------ | ------------ |
| `actions/checkout`    | `v4.2.2` | `11bd71901bbe5b1630ceea73d27597364c9af683` | Yes          |
| `actions/setup-node`  | `v4.4.0` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | Yes          |
| `appleboy/ssh-action` | `v1.2.0` | `7eaf76671a0d7eec5d98ee897acda4f968735a17` | Yes          |

Re-verify before bumping pins:

```bash
gh api repos/actions/checkout/git/refs/tags/v4.2.2 --jq .object.sha
```

## actionlint

CI installs **actionlint v1.7.7** via the upstream `download-actionlint.bash` script from the matching release tag.
