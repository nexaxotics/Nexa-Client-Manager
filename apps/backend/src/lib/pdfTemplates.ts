export function generateDocumentHtml(agency: any, client: any, type: string) {
  const brandColor = agency?.brand_color || '#4F46E5'
  const agencyName = agency?.name || 'NEXAXOTICS'
  const ownerName = agency?.owner_name || 'Agency Owner'
  
  const clientName = client?.business_name || client?.full_name || 'Valued Client'
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  
  // Base layout string incorporating beautiful modern branding
  const baseTemplate = (title: string, bodyContent: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          color: #111827;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .page {
          padding: 40px 50px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 24px;
          border-bottom: 2px solid ${brandColor};
          margin-bottom: 32px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #111827;
          margin: 0;
        }
        .header p {
          color: #6B7280;
          font-size: 13px;
          margin: 4px 0 0 0;
        }
        .accent-text {
          color: ${brandColor};
        }
        .doc-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        .meta-box {
          background: #F9FAFB;
          border-left: 4px solid ${brandColor};
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 40px;
          font-size: 14px;
          line-height: 1.6;
        }
        .meta-row {
          display: flex;
          margin-bottom: 4px;
        }
        .meta-label {
          width: 140px;
          font-weight: 600;
          color: #374151;
        }
        .meta-val {
          color: #111827;
          font-weight: 500;
        }
        h3 {
          font-size: 18px;
          color: #111827;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 8px;
          margin-top: 32px;
          margin-bottom: 16px;
        }
        p {
          line-height: 1.6;
          color: #374151;
          margin-bottom: 16px;
        }
        ul {
          line-height: 1.6;
          color: #374151;
          margin-bottom: 20px;
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #9CA3AF;
          display: flex;
          justify-content: space-between;
        }
        .signature-block {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }
        .sign-line {
          width: 45%;
          border-top: 1px solid #111827;
          padding-top: 8px;
          font-size: 14px;
          color: #374151;
        }
        .badge {
          background: rgba(79, 70, 229, 0.1);
          color: ${brandColor};
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .highlight-box {
          background: #111827;
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin: 32px 0;
        }
        .highlight-box h4 {
          color: ${brandColor};
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div>
            <h1>${agencyName}</h1>
            <p>Growth Systems • Creative Design • AI Execution</p>
          </div>
          <div style="text-align: right;">
            <p style="color: #111827; font-weight: 600;">${ownerName}</p>
            <p>${agency?.email || 'nexaxotics.agency@gmail.com'}</p>
            <p>${agency?.website || 'nexaxotics.in'}</p>
          </div>
        </div>

        <!-- Title & Meta -->
        <h2 class="doc-title">${title}</h2>
        <div class="meta-box">
          <div class="meta-row">
            <span class="meta-label">Prepared For:</span>
            <span class="meta-val">${clientName}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date:</span>
            <span class="meta-val">${dateFormatted}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Document ID:</span>
            <span class="meta-val" style="font-family: monospace; color: #6B7280;">NX-${Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
          </div>
        </div>

        <!-- Dynamic Body -->
        ${bodyContent}

        <!-- Footer -->
        <div class="footer">
          <div>${agencyName} © ${new Date().getFullYear()}</div>
          <div>Confidential & Proprietary</div>
        </div>
      </div>
    </body>
    </html>
  `

  const renderServices = (services: any) => {
    try {
      const arr = typeof services === 'string' ? JSON.parse(services) : services
      if (Array.isArray(arr) && arr.length > 0) {
        return `<ul>${arr.map(s => `<li>${s}</li>`).join('')}</ul>`
      }
    } catch(e) {}
    return '<p>Custom digital marketing packages as discussed.</p>'
  }

  // ----------------------------------------------------
  // Custom Layouts
  // ----------------------------------------------------

  const invoiceTemplate = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice - ${agencyName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: Arial, sans-serif;
                font-size: 11px;
                line-height: 1.4;
                color: #000;
                padding: 20px;
                background-color: #fff;
            }

            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px; /* Increased padding */
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
            }

            .logo-section {
                text-align: left;
                width: 30%;
            }

            .logo-placeholder {
                width: 120px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f5f5f5;
                margin-bottom: 5px;
                border-radius: 4px;
            }

            .logo-text {
                color: #2E2A6B;
                font-size: 16px;
                font-weight: 800;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: -0.5px;
            }

            .tagline {
                font-size: 10px;
                color: #666;
                margin-top: 4px;
                font-weight: 500;
            }

            .company-info {
                text-align: left;
                flex-grow: 1;
                width: 35%;
            }

            .company-info p {
                margin: 4px 0;
                color: #333;
            }

            .invoice-title {
                text-align: right;
                width: 35%;
            }

            .invoice-details {
                text-align: right;
            }

            .invoice-details h2 {
                font-size: 20px;
                color: #000;
                margin-bottom: 15px;
                font-weight: bold;
                letter-spacing: 1px;
            }

            .invoice-details p {
                margin: 4px 0;
            }

            .section {
                margin-bottom: 15px;
            }

            .section-title {
                font-weight: bold;
                border-bottom: 1px solid #000;
                margin-bottom: 5px;
                padding-bottom: 2px;
                font-size: 12px;
            }

            .info-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px; /* Added spacing below header */
            }

            .info-box {
                width: 48%;
            }

            .info-box p {
                margin: 2px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }

            th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
            }

            th {
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
            }

            td {
                vertical-align: top;
            }

            .text-center {
                text-align: center;
            }

            .text-right {
                text-align: right;
            }

            .totals-section {
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
            }

            .totals-left {
                width: 60%;
            }

            .totals-right {
                width: 38%;
                border: 1px solid #000;
            }

            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 10px;
                border-bottom: 1px solid #ddd;
            }

            .total-row.final {
                font-weight: bold;
                font-size: 12px;
                background-color: #f0f0f0;
            }

            .bank-details {
                margin-top: 20px;
                border: 1px solid #000;
                padding: 10px;
            }

            .bank-details h3 {
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
            }

            .bank-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .bank-info p {
                margin: 3px 0;
            }

            .terms {
                margin-top: 20px;
            }

            .terms h3 {
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
            }

            .terms ol {
                margin-left: 20px;
            }

            .terms li {
                margin: 5px 0;
            }

            .signature-section {
                margin-top: 30px;
                text-align: right;
            }

            .signature-box {
                border: 1px solid #000;
                width: 200px;
                height: 80px;
                margin-left: auto;
                padding: 10px;
            }

            .signature-label {
                text-align: center;
                margin-top: 5px;
                font-size: 10px;
            }

            .amount-in-words {
                margin: 10px 0;
                font-style: italic;
            }

            @media print {
                body {
                    padding: 0;
                }
                
                .invoice-container {
                    border: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <!-- 1. LOGO AREA (Left) -->
                <div class="logo-section">
                    <div class="logo-placeholder">
                        <div class="logo-text">${agencyName.toUpperCase()}</div>
                    </div>
                    <p class="tagline">Your Growth Accelerated</p>
                </div>

                <!-- 2. COMPANY INFO (Center) - REMOVED BIG TITLE -->
                <div class="company-info">
                    <p>${agency?.address || '123 Agency HQ, Global Tower'}</p>
                    <p>${agency?.city || 'Tech City, CA 90210'}</p>
                    <p>Email: ${agency?.email || 'contact@nexaxotics.com'}</p>
                    <p>Phone: ${agency?.phone || '+91 7488542781'}</p>
                </div>

                <!-- 3. INVOICE DETAILS (Right) -->
                <div class="invoice-details">
                    <h2>TAX INVOICE</h2>
                    <p><strong>Invoice No:</strong> INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
                    <p><strong>Date:</strong> ${dateFormatted}</p>
                    <p><strong>Original For Recipient</strong></p>
                </div>
            </div>

            <!-- Bill To and Ship To -->
            <div class="info-grid">
                <div class="info-box">
                    <div class="section-title">Bill To:</div>
                    <p><strong>M/S:</strong> ${clientName}</p>
                    <p><strong>Address:</strong> ${client?.address || 'Client Address Not Provided'}</p>
                    <p><strong>Email:</strong> ${client?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${client?.phone || 'N/A'}</p>
                </div>
                <div class="info-box">
                    <div class="section-title">Ship To:</div>
                    <p><strong>M/S:</strong> ${clientName}</p>
                    <p><strong>Address:</strong> ${client?.address || 'Client Address Not Provided'}</p>
                    <p><strong>Email:</strong> ${client?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${client?.phone || 'N/A'}</p>
                </div>
            </div>

            <!-- Items Table -->
            <table>
                <thead>
                    <tr>
                        <th style="width: 45%;">Description of Service</th>
                        <th style="width: 15%;">HSN/SAC</th>
                        <th style="width: 10%;">Qty</th>
                        <th style="width: 15%;">Rate</th>
                        <th style="width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${client?.services_contracted?.[0] || 'Digital Growth Services & Retainer'}</strong><br>
                            Management + company return<br>
                            (Provided by Agency)
                        </td>
                        <td class="text-center">998213</td>
                        <td class="text-center">1.00</td>
                        <td class="text-right">${Number(client?.monthly_fee || 15000).toFixed(2)}</td>
                        <td class="text-right">${Number(client?.monthly_fee || 15000).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
                <div class="totals-left">
                    <div class="amount-in-words">
                        <strong>Total in words:</strong><br>
                        AS PER INVOICED AMOUNT
                    </div>
                </div>
                <div class="totals-right">
                    <div class="total-row">
                        <span>Total Amount:</span>
                        <span>${Number(client?.monthly_fee || 15000).toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Payable:</span>
                        <span>${client?.currency === 'USD' ? '$' : '₹'}${Number(client?.monthly_fee || 15000).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Bank Details -->
            <div class="bank-details">
                <h3>Bank Details:</h3>
                <div class="bank-grid">
                    <div class="bank-info">
                        <p><strong>Account Name:</strong> ${agencyName.toUpperCase()}</p>
                        <p><strong>Bank:</strong> Global Merchant Bank</p>
                        <p><strong>Account Number:</strong> 123456789012</p>
                        <p><strong>IFSC Code:</strong> IFSB0001234</p>
                    </div>
                    <div class="bank-info">
                        <p><strong>Branch:</strong> Main Commerce Branch</p>
                        <p><strong>State:</strong> Base State</p>
                    </div>
                </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms">
                <h3>Terms and Conditions:</h3>
                <ol>
                    <li>Payment should be made within 15 days from the date of invoice.</li>
                    <li>All payments should be made via bank transfer only.</li>
                    <li>Interest @ 18% p.a. will be charged on delayed payments.</li>
                    <li>Subject to jurisdiction of your city only.</li>
                </ol>
            </div>

            <!-- Signature -->
            <div class="signature-section">
                <div class="signature-box">
                    <div style="height: 50px;"></div>
                    <div class="signature-label">Authorized Signatory<br>For ${agencyName.toUpperCase()}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `

  // ----------------------------------------------------
  // Dynamic Layouts
  // ----------------------------------------------------

  switch (type) {
    case 'agreement':
      return baseTemplate('Client Service Agreement', `
        <h3>1. Scope of Work</h3>
        <p>The Agency (<strong>${agencyName}</strong>) agrees to provide the following services for the Client (<strong>${clientName}</strong>):</p>
        ${renderServices(client?.services_contracted)}

        <h3>2. Financial Investment</h3>
        <p>The total monthly retainer fee for these growth systems is <strong>${client?.currency || 'USD'} ${client?.monthly_fee || 'TBD'}</strong>.</p>
        <p>Payments are strictly upfront to initiate the monthly cycle and are non-refundable.</p>

        <h3>3. Ownership & Revisions</h3>
        <p>All creative assets, ad campaigns, and AI automation systems built during the term remain property of the Agency until final payment is cleared. Revisions are limited to 2 rounds per creative asset to ensure maximum velocity and efficiency.</p>
        
        <h3>4. Term & Termination</h3>
        <p>This agreement begins on <strong>${dateFormatted}</strong> and runs for a continuous cycle. Either party may cancel with a 30-day written notice.</p>
        
        <div class="signature-block">
          <div class="sign-line">
            <strong>${agencyName}</strong> (Authorized Signatory)<br/><br/>
            Date:
          </div>
          <div class="sign-line">
            <strong>${clientName}</strong> (Authorized Signatory)<br/><br/>
            Date:
          </div>
        </div>
      `)

    case 'welcome_kit':
      return baseTemplate('Client Welcome Kit', `
        <h3 style="margin-top: 0;">Welcome Message</h3>
        <p>Hey <strong>${clientName}</strong>,</p>
        <p>Welcome to <strong>${agencyName.toUpperCase()}!</strong></p>
        <p>We're thrilled to partner with you and help take your brand to the next level. This welcome kit is designed to guide you through our process and ensure we collaborate smoothly and effectively.</p>

        <h3>1. Project Goals</h3>
        <p style="font-style: italic;">Our primary objectives for this project include:</p>
        <ul>
            <li><strong>Increase Brand Awareness:</strong> Get your brand in front of the right audience.</li>
            <li><strong>Generate Leads & Sales:</strong> Turn viewers into loyal customers.</li>
            <li><strong>Build a Strong Online Presence:</strong> Establish authority in your niche.</li>
            <li><strong>Improve Engagement & Consistency:</strong> Keep your audience active and interested.</li>
        </ul>

        <h3>2. Deliverables</h3>
        <p style="font-style: italic;">Here is what you can expect to receive from us:</p>
        <ul>
            <li><strong>4-5</strong> Posts per week</li>
            <li><strong>3-5</strong> Reels / Short-form Videos</li>
            <li><strong>Yes</strong> Ad Campaign Management</li>
            <li><strong>Yes</strong> Content Strategy & Planning</li>
            <li>Monthly Performance Reports</li>
        </ul>

        <h3>3. Our Work Process</h3>
        <p style="font-style: italic;">We follow a structured, results-driven workflow:</p>
        <ol style="line-height: 1.6; color: #374151; margin-bottom: 20px; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Strategy Planning:</strong> Understanding your brand voice and goals.</li>
            <li style="margin-bottom: 8px;"><strong>Content Creation:</strong> Designing and writing high-quality assets.</li>
            <li style="margin-bottom: 8px;"><strong>Client Approval:</strong> Reviewing the content together to ensure it hits the mark.</li>
            <li style="margin-bottom: 8px;"><strong>Publishing / Execution:</strong> Scheduling and posting across platforms.</li>
            <li style="margin-bottom: 8px;"><strong>Optimization:</strong> Adjusting strategies based on real-time data.</li>
            <li style="margin-bottom: 8px;"><strong>Reporting:</strong> Providing transparent results and insights.</li>
        </ol>

        <h3>4. Communication System</h3>
        <p style="font-style: italic;">To maintain smooth and efficient collaboration:</p>
        <ul>
            <li><strong>Primary Platform:</strong> WhatsApp / Email / Slack</li>
            <li><strong>Response Time:</strong> Within 24 hours</li>
            <li><strong>Working Days:</strong> Monday &ndash; Saturday</li>
            <li><strong>Calls/Meetings:</strong> Pre-scheduled only (to ensure we value each other's time)</li>
        </ul>

        <h3>5. What We Need From You</h3>
        <p style="font-style: italic;">To ensure timely delivery and the best possible results, please provide:</p>
        <ul>
            <li><strong>Brand Assets:</strong> High-res logo, color hex codes, and brand fonts.</li>
            <li><strong>Access:</strong> Login credentials or admin access to required platforms/accounts.</li>
            <li><strong>Inspiration:</strong> Content references, mood boards, or competitor examples (if available).</li>
            <li><strong>Feedback:</strong> Timely approvals and constructive feedback on drafts.</li>
        </ul>

        <h3>6. Timeline & Workflow</h3>
        <p style="font-style: italic;">How a typical month looks:</p>
        <ul>
            <li><strong>Week 1:</strong> Strategy, research, and content planning.</li>
            <li><strong>Week 2:</strong> Content creation and client approval.</li>
            <li><strong>Ongoing:</strong> Daily posting, community management, optimization, and monitoring.</li>
        </ul>

        <h3>7. Reporting System</h3>
        <p style="font-style: italic;">We believe in data-driven growth. Every month, you will receive:</p>
        <div class="highlight-box" style="margin: 16px 0; padding: 20px; background: #F9FAFB; border-left: 4px solid ${brandColor}; border-radius: 0 8px 8px 0;">
            <ul style="margin: 0;">
                <li>A comprehensive <strong>Monthly Performance Report</strong>.</li>
                <li>Key insights and analytics broken down simply.</li>
                <li>Actionable recommendations for the following month.</li>
            </ul>
        </div>

        <h3>8. Important Notes</h3>
        <ul>
            <li><strong>Patience Pays Off:</strong> Real, sustainable results take time &mdash; there is no overnight growth.</li>
            <li><strong>Consistency is Key:</strong> Showing up regularly is the secret to algorithmic success.</li>
            <li><strong>Teamwork:</strong> Open collaboration and communication lead to the best possible results!</li>
        </ul>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;" />
        
        <h3 style="color: ${brandColor}; border-bottom: none; margin-bottom: 8px;">Let's Build Together</h3>
        <p>We're incredibly excited to work with you and build something truly impactful. Let's grow your brand the right way!</p>
        
        <p style="margin-top: 32px; margin-bottom: 0;"><strong>Best Regards,</strong></p>
        <p style="margin-top: 8px; font-weight: 600; font-size: 16px;">Team ${agencyName.toUpperCase()}</p>
        <p style="margin-top: 4px; color: #6B7280; font-size: 13px;">
            Email: ${agency?.email || 'contact@nexaxotics.com'}<br/>
            Phone: ${agency?.phone || '+91 00000 00000'}<br/>
            Website: ${agency?.website || 'nexaxotics.in'}
        </p>
      `)

    case 'invoice':
      return invoiceTemplate()

    case 'access_request':
      return baseTemplate('System Access Request', `
        <p>To hit the ground running, we need administrative access to your digital ecosystem. Please follow the instructions below to safely share your credentials or grant us manager-level permissions.</p>
        
        <h3>1. Social Media Infrastructure</h3>
        <ul>
          <li><strong>Instagram (${client?.instagram_handle || 'Handle'}):</strong> Provide login details via LastPass or 1Password.</li>
          <li><strong>Facebook Page (${client?.facebook_page || 'Page'}):</strong> Add our Business Manager email as a Page Admin.</li>
        </ul>

        <h3>2. Advertising Core</h3>
        <ul>
          <li><strong>Meta Ads Manager (${client?.ad_account_id || 'ID'}):</strong> Assign us 'Admin' level access.</li>
          <li><strong>Google Ads (${client?.google_ads_id || 'ID'}):</strong> Add our MCC email via ID.</li>
        </ul>

        <h3>3. Website & Analytics</h3>
        <ul>
          <li><strong>Website Backend (${client?.website_cms || 'CMS'}):</strong> E.g. Shopify, WordPress, Webflow access.</li>
          <li><strong>Google Analytics:</strong> Share view & edit access.</li>
        </ul>
      `)

    case 'kickoff':
      return baseTemplate('Kickoff Meeting Brief', `
        <p>This brief outlines the strategic agenda for our official kickoff sequence. Please review these parameters before our call (${client?.meeting_platform || 'Zoom/Meet'}).</p>

        <div class="highlight-box">
          <h4>Core Objectives</h4>
          <p style="margin-bottom: 0;"><strong>Stated Business Goals:</strong> ${client?.business_goals || 'Scaling acquisition & increasing brand authority.'}</p>
          <p style="margin-bottom: 0; margin-top: 12px;"><strong>Target Audience Pivot:</strong> ${client?.target_audience || 'To be defined on call.'}</p>
        </div>

        <h3>Agenda Items</h3>
        <ol>
          <li><strong>Brand Voice Audit:</strong> Aligning on the tonality and visual language.</li>
          <li><strong>System Architecture:</strong> Briefing you on our AI-assisted workflow.</li>
          <li><strong>Content Milestones:</strong> Defining the next 30 days of output.</li>
          <li><strong>KPI Definition:</strong> Benchmarking ${client?.key_metrics || 'traffic, engagement, and distinct conversions'}.</li>
        </ol>
      `)

    case 'dashboard':
      return baseTemplate('Client Command Center', `
        <p>Your transparent project management dashboard has been initialized.</p>
        
        <h2 style="font-size: 48px; text-align: center; margin: 40px 0;">⚙️</h2>
        <p style="text-align: center; font-size: 18px; font-weight: 500;">Everything we build runs through your bespoke <strong>Notion Workspace</strong>.</p>
        
        <ul>
          <li><strong>Kanban Content Calendar:</strong> See what's drafting, reviewing, and scheduled.</li>
          <li><strong>Asset Drive:</strong> Download final videos, graphics, and ad creatives.</li>
          <li><strong>Live Reporting Link:</strong> Immediate access to the datastream.</li>
        </ul>

        <p style="margin-top: 40px; text-align: center;"><em>Your unique access link has been sent securely via email to ${client?.email}. Please bookmark it.</em></p>
      `)

    case 'weekly_update':
      return baseTemplate('Weekly Performance Pulse', `
        <p>We believe in radical transparency. Here is the snapshot of everything executed this week and the sprint sequence for next week.</p>

        <h3>✅ Completed The Sprints</h3>
        <ul>
          <li>Creative design finalization.</li>
          <li>Content calendar population for upcoming dates.</li>
          <li>Campaign optimizations and AI automation maintenance.</li>
        </ul>

        <h3>🚀 Next Week's Blueprint</h3>
        <ul>
          <li>Roll out the new funnel structures.</li>
          <li>Record and edit next batch of short-form videos.</li>
          <li>Scale ad spending vertically on winning creatives.</li>
        </ul>

        <p style="font-style: italic; color: #6B7280; margin-top: 32px;">No active blockers observed. Systems running nominally.</p>
      `)

    case 'monthly_report':
      return baseTemplate('Monthly Growth Report', `
        <p>Data drives our decisions. This document highlights the macro-level impact of the systems we deployed for ${clientName}.</p>

        <div style="display: flex; gap: 20px; margin: 32px 0;">
          <div style="flex: 1; padding: 24px; background: ${brandColor}; color: white; border-radius: 12px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.8; text-transform: uppercase; font-weight: 600;">Core KPI Focus</p>
            <h2 style="margin: 0; font-size: 32px;">${client?.key_metrics || 'Aura & Reach'}</h2>
          </div>
        </div>

        <h3>Insights & Tactical Shift</h3>
        <p>The content architectures leveraging strong visual hooks outperformed conventional patterns by a staggering margin.</p>
        <p><strong>Next Strategy:</strong> We will double-down on high-velocity short form content while deploying AI-based engagement workflows to capture the inbound volume efficiently.</p>
      `)

    case 'feedback':
      return baseTemplate('Strategic Feedback Loop', `
        <p>Your feedback fuels our capability. We want to ensure the systems we're deploying align perfectly with the trajectory of ${clientName}.</p>

        <div class="highlight-box" style="background: #F3F4F6; color: #111827; border: 1px solid #E5E7EB;">
          <h4 style="color: #111827;">We'd love your testimonial</h4>
          <p>If you're thrilled with our impact, a quick two-sentence review goes a long way. Let us know how our design, content strategy, and AI automation have shifted your business.</p>
        </div>

        <p>Please reach out immediately if any adjustments to our workflow or creative output are desired. <em>(Use our designated Slack channel or email reply).</em></p>
      `)

    case 'offboarding':
      return baseTemplate('Project Offboarding Summary', `
        <p>It has been a privilege building growth systems for ${clientName}. As our engagement model concludes, our priority is zero friction in this transition.</p>

        <h3>Final Deliverables Transferred</h3>
        <ul>
          <li>All raw graphic elements and final exports have been synced to the primary drive.</li>
          <li>Automation workflows have been fully documented and handed over.</li>
          <li>Administrative access rights to all your social and ad networks have been revoked appropriately.</li>
        </ul>

        <h3>Our Final Recommendation</h3>
        <p>You have a stellar baseline. We recommend keeping the visual tempo consistent and heavily reinvesting your profits back into top-of-funnel ad spend.</p>
        <p style="margin-top: 40px; text-align: center; font-weight: 600;">Keep scaling.</p>
      `)

    default:
      return baseTemplate('Document', '<p>Standard document placeholder.</p>')
  }
}
