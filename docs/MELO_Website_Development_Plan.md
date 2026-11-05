# MELO --- Website Development Plan

**Project:** MELO multi-category online store\
**Initial market:** Bangladesh\
**Document status:** Initial product and development plan\
**Working brand:** MELO --- subject to domain, social-handle, and
trademark checks

------------------------------------------------------------------------

## 1. Project Overview

MELO is a Bangladesh-focused online reselling store designed to make it
easy for customers to discover and buy small, useful, fun, and giftable
products.

The store will launch with a focused selection of:

-   Bracelets
-   Earrings
-   Rings

It should be built so that additional categories can be introduced later
without redesigning the whole website. Possible future categories
include toys, gadgets, accessories, gifts, and lifestyle products.

**Brand direction**

-   Friendly, modern, playful, and welcoming
-   Easy to read and pronounce in both Bangla and English
-   Suitable for customers looking for affordable everyday products and
    gifts
-   Visual identity may combine a friendly hippo mascot with
    aurora-inspired colours

**Working brand message**

> MELO --- Discover. Love. Repeat.

Supporting line:

> A little something for everyone.

Optional visual tagline:

> Where Little Wonders Light Up.

The name MELO is a working choice, not a confirmed legally available
brand. Existing businesses use similar names, so complete local checks
before investing heavily in branding.

------------------------------------------------------------------------

## 2. Goals and Success Criteria

### Primary goals

1.  Launch a trustworthy, mobile-friendly online store.
2.  Make product discovery and checkout simple.
3.  Support Bangladesh-specific delivery, payment, and customer-contact
    needs.
4.  Let the owner manage products, stock, orders, and promotions without
    editing code.
5.  Keep the initial build affordable and easy to maintain.
6.  Make it straightforward to add new product categories later.

### Initial success criteria

-   Customers can browse products by category.
-   Product pages show clear images, prices, descriptions, and
    availability.
-   Customers can place an order from a phone or computer.
-   The owner can update products and order statuses from an admin area.
-   Customers receive clear order confirmation and delivery information.
-   The site loads quickly and works on common mobile screen sizes.
-   Basic analytics can measure visits, product views, and completed
    orders.

------------------------------------------------------------------------

## 3. Target Customers

The initial audience is online shoppers in Bangladesh, particularly
people buying:

-   Affordable jewellery and accessories
-   Small gifts for friends and family
-   Cute, practical, or interesting everyday items
-   Products discovered through Facebook, Instagram, and other social
    channels

The design should be approachable and clear rather than overly luxurious
or limited to one age group.

### Customer needs

-   Clear product photos and accurate descriptions
-   Transparent prices and delivery charges
-   Confidence that an order has been received
-   Simple ways to contact the store
-   Familiar payment and delivery options
-   A smooth mobile shopping experience

------------------------------------------------------------------------

## 4. Scope: MVP and Later Releases

Build the smallest useful store first. Avoid adding complex features
before the basic ordering process works reliably.

### MVP --- first launch

  -----------------------------------------------------------------------
  Area                                Required functionality
  ----------------------------------- -----------------------------------
  Home page                           Brand introduction, featured
                                      products, category links,
                                      promotions

  Product catalogue                   Product grid, category browsing,
                                      basic sorting

  Product details                     Images, name, price, description,
                                      stock status, variants if needed

  Search                              Search by product name and relevant
                                      keywords

  Cart                                Add, remove, and update quantities

  Checkout                            Customer details, delivery address,
                                      delivery method, payment method

  Orders                              Order creation and order
                                      confirmation

  Admin                               Manage products, categories, stock,
                                      and orders

  Contact                             Contact details, social links, FAQ,
                                      and order support

  Policies                            Delivery, returns/refunds, privacy,
                                      and terms

  Responsive design                   Mobile, tablet, and desktop layouts
  -----------------------------------------------------------------------

### Release 2 --- after the ordering flow is stable

-   Customer accounts and order history
-   Discount codes and campaign pricing
-   Product reviews and ratings
-   Wishlist
-   Related products and recommendations
-   Better inventory reporting
-   Abandoned-cart follow-up, where consent and platform rules allow
-   Bangla and English content support

### Release 3 --- growth

-   Additional categories such as toys, gadgets, and lifestyle products
-   Supplier and purchase-cost tracking
-   More advanced sales reports
-   Loyalty or rewards programme
-   Automated marketing integrations
-   Multiple staff roles and permissions
-   More advanced search and filtering

------------------------------------------------------------------------

## 5. Recommended Website Structure

### Public pages

``` text
/
├── Home
├── Shop
│   ├── Jewellery
│   │   ├── Bracelets
│   │   ├── Earrings
│   │   └── Rings
│   ├── Toys                 (future)
│   ├── Gadgets              (future)
│   └── Lifestyle            (future)
├── Product Details
├── Search Results
├── Cart
├── Checkout
├── Order Confirmation
├── About MELO
├── Contact
├── FAQ
├── Delivery Policy
├── Return & Refund Policy
├── Privacy Policy
└── Terms & Conditions
```

### Admin pages

``` text
/admin
├── Dashboard
├── Products
├── Categories
├── Inventory
├── Orders
├── Customers              (only if customer data is stored)
├── Discounts
├── Content / Banners
└── Settings
```

The admin area must be protected. Public visitors must never be able to
access administrative operations.

------------------------------------------------------------------------

## 6. Core User Journeys

### Shopping journey

1.  Customer opens the home page.
2.  Customer browses a category or searches for a product.
3.  Customer opens a product page and checks images, price, details, and
    availability.
4.  Customer adds the product to the cart.
5.  Customer reviews the cart and proceeds to checkout.
6.  Customer enters their name, phone number, and delivery address.
7.  Customer chooses an available payment and delivery option.
8.  Customer confirms the order.
9.  The site displays an order reference and confirmation message.
10. The store processes the order and updates its status.

### Store-owner journey

1.  Owner signs in to the admin area.
2.  Owner adds a product with its images, price, description, category,
    and stock quantity.
3.  Owner reviews incoming orders.
4.  Owner confirms stock and customer details.
5.  Owner updates the order status as it is processed and dispatched.
6.  Owner records cancellations, returns, or stock changes where
    applicable.

------------------------------------------------------------------------

## 7. Product and Order Data

Plan the data model before building the checkout and admin features.

### Suggested entities

  -----------------------------------------------------------------------
  Entity                              Important fields
  ----------------------------------- -----------------------------------
  Product                             id, name, slug, description,
                                      selling_price, status, category_id

  Product Image                       id, product_id, image_url,
                                      display_order, alt_text

  Category                            id, name, slug, parent_id, status

  Product Variant                     id, product_id, variant_name,
                                      variant_value, price_adjustment,
                                      stock

  Inventory                           product_id or variant_id,
                                      quantity_available,
                                      low_stock_threshold

  Cart                                id, session/customer reference,
                                      created_at

  Cart Item                           cart_id, product_id, variant_id,
                                      quantity

  Customer                            id, name, phone, email if provided

  Address                             customer_id, recipient, phone,
                                      address lines, area, city, postal
                                      code

  Order                               id, order_number, customer details,
                                      subtotal, delivery_fee, discount,
                                      total, status

  Order Item                          order_id, product_id,
                                      product_name_snapshot, unit_price,
                                      quantity

  Payment                             order_id, method, amount, status,
                                      transaction reference

  Discount                            code, discount_type, value,
                                      start_at, end_at, usage_limit,
                                      status
  -----------------------------------------------------------------------

### Important data rules

-   Store money using an appropriate decimal or integer minor-unit
    representation; do not use floating-point arithmetic for totals.
-   Save the product name and unit price as snapshots in each order
    item. Later product edits must not change an existing order.
-   Validate stock when an order is placed and again when it is
    processed.
-   Generate unique, non-guessable order references.
-   Do not store raw card details or payment credentials.
-   Keep an audit trail for important admin actions such as price,
    stock, and order-status changes.

------------------------------------------------------------------------

## 8. Technology Options

Choose the stack based on the expected order volume, budget, and how
much backend control is needed. Avoid unnecessary infrastructure at the
beginning.

### Practical starting option

  -----------------------------------------------------------------------
  Layer                   Suggested option        Why
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite +          Fast development and
                          TypeScript              reusable components

  Styling                 Tailwind CSS            Consistent responsive
                                                  UI

  Backend / database      Supabase (PostgreSQL)   Managed database,
                                                  authentication, and
                                                  APIs

  Product images          Supabase Storage or an  Centralised image
                          image CDN               storage

  Hosting                 Cloudflare Pages or     Simple deployment for
                          Vercel                  the frontend

  Source control          GitHub                  Version history and
                                                  collaboration

  Analytics               Privacy-conscious       Understand traffic and
                          analytics solution      conversion
  -----------------------------------------------------------------------

This is a starting recommendation, not a fixed requirement. A custom API
can be introduced if business logic becomes more complex.

### Alternative: custom backend

If greater backend control is needed, use:

-   React + TypeScript frontend
-   Node.js with Express or NestJS, or Python with FastAPI
-   PostgreSQL database
-   Object storage for product images
-   A managed hosting platform for the API and database

Do not run a production database on a personal computer.

### Cost-control principles

-   Start with free or low-cost managed tiers only after checking their
    current limits and terms.
-   Monitor database, image-storage, bandwidth, and email usage.
-   Set billing alerts where the provider supports them.
-   Back up the database regularly.
-   Estimate monthly costs before enabling paid services.
-   Do not assume a free tier will remain free as traffic grows.

------------------------------------------------------------------------

## 9. Bangladesh-Specific Requirements

Confirm provider availability, eligibility, fees, and integration
requirements before choosing services.

### Payments

Potential payment methods to investigate:

-   Cash on Delivery (COD)
-   Mobile financial services through an authorised merchant integration
-   Online payment gateway supporting local payment methods

For any online payment provider:

-   Apply for the correct merchant account.
-   Use the provider's official integration and current documentation.
-   Verify payment status on the server using a trusted callback or API.
-   Never mark an order as paid based only on a browser redirect.
-   Store transaction references and payment status, not sensitive
    payment credentials.

### Delivery

Investigate courier providers that serve the intended delivery areas.
Compare:

-   Delivery coverage
-   Inside-Dhaka and outside-Dhaka pricing
-   Cash collection and settlement process
-   Delivery time estimates
-   Return and exchange handling
-   Tracking support
-   API availability and integration costs

At launch, manual courier booking may be sufficient. Automate it only
when order volume justifies the work.

### Customer communication

Provide a clear support channel, such as a business phone number, email,
or official social page. Order messages should be accurate and should
not expose customer information to other customers.

### Legal and trust requirements

Before launch, review applicable Bangladesh requirements for online
commerce, consumer rights, privacy, taxation, and business registration
with a qualified local adviser or the relevant authorities. Publish
clear policies and truthful product information.

------------------------------------------------------------------------

## 10. Design and Brand Direction

### Visual identity

-   Wordmark: MELO
-   Personality: friendly, curious, colourful, dependable
-   Possible mascot: a simple, friendly hippo
-   Visual motif: soft aurora-inspired flowing shapes or gradients
-   Keep the logo readable at small sizes and in a single colour.

### Suggested design principles

-   Mobile-first layout
-   Clear product photography
-   Readable typography
-   Strong contrast for important text and buttons
-   Consistent spacing and button styles
-   Avoid excessive animation
-   Keep pages lightweight for mobile networks
-   Use clear labels for price, stock, delivery, and checkout actions

### Homepage content order

1.  Header with logo, search, account/cart links
2.  Main campaign banner
3.  Shop by category
4.  New arrivals
5.  Popular products
6.  Why shop with MELO
7.  Delivery and support information
8.  Social media section
9.  Footer with policies and contact details

------------------------------------------------------------------------

## 11. Security and Reliability

Security must be included from the beginning.

-   Use HTTPS for the entire website.
-   Keep admin routes and database operations protected by server-side
    authorization.
-   Never expose service-role keys, private API keys, or database
    passwords in frontend code.
-   Validate all user input on the server.
-   Use secure authentication and strong admin credentials.
-   Apply role-based access if more than one staff member will use the
    admin panel.
-   Rate-limit sensitive endpoints such as login, checkout, and contact
    forms.
-   Protect against common web vulnerabilities, including SQL injection,
    cross-site scripting, and cross-site request forgery where relevant.
-   Verify payment notifications server-side.
-   Keep dependencies updated.
-   Back up the database and test restoration.
-   Log errors without unnecessarily logging passwords, payment data, or
    sensitive customer details.

------------------------------------------------------------------------

## 12. SEO, Performance, and Analytics

### SEO basics

-   Give every product and category a readable URL.
-   Write unique product titles and descriptions.
-   Add descriptive image alt text.
-   Use page titles and meta descriptions.
-   Create a sitemap and robots.txt.
-   Use canonical URLs where appropriate.
-   Add structured product data only when it accurately reflects the
    page.
-   Avoid duplicate product pages for the same item.

### Performance

-   Compress and resize product images.
-   Use modern image formats where supported.
-   Lazy-load images below the first screen.
-   Avoid large JavaScript bundles.
-   Minimise unnecessary animation and third-party scripts.
-   Test on mobile devices and slower connections.

### Analytics

Track a small set of useful events:

-   Product viewed
-   Search performed
-   Add to cart
-   Checkout started
-   Order completed
-   Checkout abandoned, if implemented appropriately

Use analytics to improve the store, not to collect unnecessary personal
information.

------------------------------------------------------------------------

## 13. Development Roadmap

The estimates below are indicative for a small project and depend on the
chosen stack, available time, and payment/courier integrations.

  ------------------------------------------------------------------------
  Phase                 Work                           Indicative duration
  --------------------- --------------------- ----------------------------
  1\. Planning          Confirm business                         2--4 days
                        rules, products,      
                        delivery areas,       
                        payment options       

  2\. UX and branding   Sitemap, wireframes,                     3--5 days
                        colours, typography,  
                        logo direction        

  3\. Project setup     Repository,                              1--3 days
                        environments,         
                        database, hosting     
                        setup                 

  4\. Storefront        Home, categories,                        5--8 days
                        product listing,      
                        product details,      
                        search                

  5\. Cart and checkout Cart, customer                           4--7 days
                        details, delivery     
                        fee, order placement  

  6\. Admin panel       Authentication,                          5--8 days
                        product, category,    
                        inventory, order      
                        management            

  7\. Integrations      Payment and courier                      2--7 days
                        workflows; manual     
                        process first if      
                        needed                

  8\. Testing           Functional,                              3--5 days
                        responsive, security, 
                        and checkout testing  

  9\. Launch            Domain, production                       1--2 days
                        configuration,        
                        policies, initial     
                        products              
  ------------------------------------------------------------------------

**Indicative MVP total:** approximately 4--7 weeks for one developer
working consistently. Integrations, content preparation, and business
setup may extend this.

### Milestones

-   **M1:** Requirements and brand direction approved
-   **M2:** Database and project setup complete
-   **M3:** Product browsing works
-   **M4:** Cart and order placement work
-   **M5:** Admin can manage products and orders
-   **M6:** Testing and launch checklist complete
-   **M7:** First real orders processed and reviewed

------------------------------------------------------------------------

## 14. Testing Checklist

### Storefront

-   [ ] Home page works on mobile and desktop.
-   [ ] Category navigation works.
-   [ ] Search returns relevant products.
-   [ ] Product images and details display correctly.
-   [ ] Out-of-stock products cannot be ordered.
-   [ ] Variants are handled correctly where used.

### Cart and checkout

-   [ ] Quantities can be updated and items removed.
-   [ ] Prices and totals are recalculated securely.
-   [ ] Delivery fees are displayed before confirmation.
-   [ ] Required customer fields are validated.
-   [ ] Duplicate submissions do not create duplicate orders.
-   [ ] Order confirmation displays a valid order reference.
-   [ ] Payment status is verified server-side.

### Admin

-   [ ] Only authorised staff can sign in.
-   [ ] Products and categories can be created and edited.
-   [ ] Stock changes are recorded correctly.
-   [ ] Orders can be found and updated.
-   [ ] Important actions are logged.
-   [ ] Admin functions cannot be called by unauthorised users.

### Launch readiness

-   [ ] Domain and HTTPS are configured.
-   [ ] Privacy, delivery, returns, and terms pages are published.
-   [ ] Contact information is correct.
-   [ ] Database backup is configured.
-   [ ] Error monitoring is enabled.
-   [ ] A test order has been completed end to end.
-   [ ] Initial product photos and descriptions are ready.

------------------------------------------------------------------------

## 15. Risks and Decisions to Resolve

  -----------------------------------------------------------------------
  Risk / open decision                Recommended action
  ----------------------------------- -----------------------------------
  MELO name may already be in use     Check Bangladesh trademark records,
                                      relevant classes, domains, and
                                      social handles before finalising

  Unclear supplier stock              Start with a small catalogue and
                                      track stock carefully

  Delivery fees reduce profit         Calculate delivery and packaging
                                      costs before setting prices

  COD orders may be cancelled or      Confirm orders and define a clear
  refused                             cancellation process

  Payment integration delays          Start with a clearly documented
                                      manual/COD workflow if appropriate

  Too many categories at launch       Launch with jewellery first; add
                                      categories after the process is
                                      stable

  Unexpected hosting costs            Set usage alerts and review
                                      provider pricing before launch

  Product images are inconsistent     Use a simple photography guide and
                                      consistent image dimensions
  -----------------------------------------------------------------------

### Decisions needed before development

1.  Will MELO hold stock, or will products be ordered from suppliers
    after a customer places an order?
2.  Which areas of Bangladesh will delivery cover at launch?
3.  Which payment methods will be available on day one?
4.  Will customers check out as guests, or must they create accounts?
5.  Who will manage products, orders, and customer support?
6.  What is the initial development and monthly operating budget?
7.  Which domain and social handles are available and appropriate?

------------------------------------------------------------------------

## 16. Recommended Build Order

To avoid spending time on features that do not help the first sale,
follow this order:

1.  Confirm the business model, suppliers, product costs, delivery fees,
    and policies.
2.  Verify the MELO name and secure an appropriate domain and social
    handles.
3.  Prepare the first 15--30 products with accurate photos, prices,
    descriptions, and stock.
4.  Design the mobile home page, category page, and product page.
5.  Build product and category management.
6.  Build cart, checkout, and order management.
7.  Add the selected payment and delivery workflow.
8.  Test the complete order process.
9.  Launch with jewellery as the initial category.
10. Review customer feedback and operational issues before expanding.

------------------------------------------------------------------------

## 17. Immediate Next Steps

The first practical tasks are:

-   [ ] Confirm whether the business is inventory-based or
    supplier-fulfilled.
-   [ ] Set an initial budget for development, stock, packaging, and
    marketing.
-   [ ] Check MELO name availability in Bangladesh and internationally
    relevant channels.
-   [ ] Choose the initial payment and courier arrangements.
-   [ ] Select the first products and calculate selling prices.
-   [ ] Approve the MVP feature list.
-   [ ] Create the repository and a simple wireframe.
-   [ ] Build and test the storefront before adding optional features.

**Guiding principle:** Launch a small, trustworthy MELO store that
handles orders correctly. Expand the catalogue and automation only after
the core shopping and fulfilment process is working well.
