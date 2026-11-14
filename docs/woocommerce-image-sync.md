# WooCommerce product images

Source: https://paraofficinal.store, using the public WooCommerce Store API. No API keys are required. Only publicly exposed products are available; drafts/private products are excluded by WooCommerce.

## First import

1. Apply `supabase/migrations/20261114190000_woocommerce_image_sync.sql` and `supabase/migrations/20261114200000_woocommerce_images_empty_products_only.sql` in order to the target database using the normal migration workflow. Deploy the application.
2. Open `/admin/cron` as an operator with catalog editing permission. Click **Prévisualiser les images**. Preview reads both catalogs without uploading images or changing products.
3. Review the matching SKUs and image links, then click **Importer les nouvelles images**. Check **Afficher l’historique** for per-product results. A failed or partial import can be retried; successful copies are reused.
4. Enable scheduling only after checking the first import.

The importer matches trimmed, case-insensitive SKUs, preserving leading zeros. Duplicate SKUs on either side are skipped. It never creates products or updates names, prices, stock, publishing status, or descriptions. It imports only products with no real main image and no real gallery images. Empty values and `/placeholder.png` count as missing. Any existing main or gallery image makes the entire product ineligible, even if WooCommerce has additional images. Eligible products receive the available WooCommerce main/gallery images once; subsequent runs skip them. Removing or replacing an image in WooCommerce does not modify a product that already has images here.

Images must be hosted under this store's HTTPS `/wp-content/uploads/` path. Redirects and external image hosts are rejected. Downloads are limited to 10 MiB and 40 million decoded pixels, converted to WebP, and uploaded into the existing public `products` bucket under `woocommerce/`. An eligible product's database images are saved only after all its new images have uploaded. Failed uploads may leave reusable, unreferenced objects. Storage and network usage increase with imports.

Eligibility is checked again under a product row lock immediately before writing. If someone has added any main or gallery image since the catalog scan, the entire product is skipped without modifying its fields. A database lease prevents simultaneous WooCommerce importers. Each run has a four-minute network budget, leaving time to save results within the Vercel Hobby 300-second function limit; retry interrupted runs to process remaining images. The existing Atlascom code is unchanged and still writes its full previously read product rows, so overlapping catalog jobs can race. Review logs if jobs overlap; another image run can restore images only if the affected product is again completely without images. The timer is offset from the Atlascom timer to reduce overlap, not to guarantee exclusion.

## VPS schedule (disabled until configured)

Install the new files separately; do not replace the Atlascom runner or timer:

```sh
sudo install -m 644 deploy/hostinger/woocommerce-images.mjs /usr/local/lib/paradivine/woocommerce-images.mjs
sudo install -m 644 deploy/hostinger/paradivine-woocommerce-images.service /etc/systemd/system/
sudo install -m 644 deploy/hostinger/paradivine-woocommerce-images.timer /etc/systemd/system/
```

Set `WOOCOMMERCE_IMAGE_SYNC_ENABLED=true` in `/srv/paradivine/shared/app.env`, retaining the existing `CRON_SECRET`. Restart the application to load the setting, then:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now paradivine-woocommerce-images.timer
sudo systemctl list-timers paradivine-woocommerce-images.timer
```

Runs are scheduled at :12/:27/:42/:57 UTC. Inspect `journalctl -u paradivine-woocommerce-images.service` and the admin image history. To stop automatic imports, disable this timer or remove the enabled environment setting and restart the app. Manual preview/import remains available. No production migration, deployment, import, or timer activation is performed by adding these files.
