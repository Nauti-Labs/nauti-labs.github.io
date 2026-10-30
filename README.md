# Nauti-Labs site

Static GitHub Pages site for nauti-labs.com. Pages are plain HTML in this repository.

## Folders

- `assets/` — marks, the homepage video, and the product switch (`products.json`, `product-switch.js`)
- `brand/` — locked brand system
- `felipe/` — Felipe desk shell. Stays parked while `felipe` is off in the switch
- `go/` — tracked outbound links. Leave `go/wheaton-creek/` as it is
- `labs/` — labs overview
- `maritime/` — maritime consulting
- `neighbors/` — on-site Neighbors help
- `og/` — share images
- `products/` — what is open today
- `promptly/` — Promptly page. Stays parked, with checkout hidden, while `promptly` is off
- `suite/` — public up/down status only
- `tankers-and-tumbleweeds/` — story page. Leave the copy as it is
- `tankers-to-timber/` — redirect to the story page, `noindex`
- `traffic/` — traffic boards. Parked boards wait on the same switch
- `triton/` — handoff to the Triton pilot at ops.nauti-labs.com
- `_server/` — local static server used for host practice. Jekyll does not publish folders whose names start with `_`

## Flip a product back to live

Edit `assets/products.json` and set `"live": true` for that key. Push to `main`. GitHub Pages will publish the file, and every `data-product` control for that key becomes a link again.

| Key | Set `live` to `true` to restore |
| --- | --- |
| `clearance` | Clearance links, including the traffic board (`traffic`) |
| `clearance-mcp` | The products-page button. Also set `href` to the public URL first; an empty `href` stays parked |
| `promptly` | Promptly links, pass checkout, and both Promptly traffic boards (`traffic`, `tritonTraffic`) |
| `neighbors` | Links that point at neighbors.nauti-labs.com. The on-site help page at `/neighbors/` stays up either way |
| `felipe` | The Felipe desk and its traffic board (`traffic`) |

Triton at `https://ops.nauti-labs.com` is not in the switch. Leave it linked while that pilot is up.

While a product is `"live": false`, public pages do not put its host in `href` or `src`. The hosts live only in `assets/products.json`, so one file is the switch.
