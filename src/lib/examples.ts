export interface ExampleTranscript {
  label: string
  role: string
  department: string
  workflowName: string
  rawTranscript: string
}

export const EXAMPLE_TRANSCRIPTS: ExampleTranscript[] = [
  {
    label: "Finance: Invoice Processing",
    role: "Accounts Payable Clerk",
    department: "Finance",
    workflowName: "Invoice Processing",
    rawTranscript: `Agent: Thanks for meeting with me today. I'd love to understand how invoice processing works in your day-to-day. Can you walk me through what happens when a new invoice comes in?

Employee: Sure. So invoices come in through a few different channels — some arrive via email, some through our vendor portal, and honestly a few still come in as paper mail that someone scans. It's kind of a mess.

Agent: Got it — so there's no single intake point. Once an invoice lands with you, what's the first thing you do?

Employee: First I check if there's a matching purchase order in SAP. I pull up our PO module, search by vendor name or PO number if it's on the invoice. Maybe 70% of the time there's a match. The other 30% I have to chase down the requester to figure out what it's for.

Agent: That chasing down — how does that work?

Employee: I send a Slack message or email to the department that probably ordered it, based on the vendor. Sometimes I'm guessing. If nobody responds in a day I escalate to my manager. The whole back-and-forth can take 2-3 days for a single invoice. It's my biggest time sink.

Agent: Once you have the PO match, what happens next?

Employee: I do a three-way match — invoice amount versus PO amount versus the goods receipt in SAP. If everything matches within our tolerance threshold — which is 2% or $100, whichever is less — I code it to the right GL account and cost center, then submit it for approval.

Agent: How long does the three-way match take?

Employee: If it's clean, maybe 10 minutes per invoice. But about 40% of the time there's a discrepancy — wrong quantities, pricing differences, missing goods receipt. Then I have to email the vendor or the receiving team. That can add another day or two.

Agent: And the approval process?

Employee: I route it through our approval workflow in SAP. Under $5,000 goes to the department manager, $5,000 to $25,000 needs director approval, and above that needs VP sign-off. The system handles the routing but approvers are slow — average approval time is 4 days, which is ridiculous.

Agent: After approval, what's the final step?

Employee: I schedule it for payment based on our payment terms — usually Net 30 or Net 45. I batch payments weekly on Thursdays. Then I reconcile everything in our AP aging report in Excel at the end of each week.

Agent: How many invoices do you process in a typical week?

Employee: Probably 80-100. I spend about 30 hours a week on this. The matching and chasing are what kill me — I wish the system could just auto-match the obvious ones.`,
  },
  {
    label: "HR: Employee Onboarding",
    role: "HR Coordinator",
    department: "HR",
    workflowName: "New Employee Onboarding",
    rawTranscript: `Agent: I'd like to understand your new employee onboarding process from start to finish. When does it kick off for you?

Employee: It starts when I get a notification from our ATS — we use Greenhouse — that an offer has been accepted. I get an email alert and then everything starts from there.

Agent: What's the first thing you do when you get that alert?

Employee: I create the employee record in Workday. I need to enter all their personal info, job title, department, manager, start date, compensation details. It takes about 20 minutes per person because I'm copying from the offer letter in Greenhouse to Workday and they don't talk to each other.

Agent: They're not integrated?

Employee: Nope. We've asked IT about it for two years. So I'm literally copying name, address, salary, everything field by field. It's tedious and I've made typos before that caused payroll issues.

Agent: After the Workday setup, what comes next?

Employee: I send what I call the "welcome packet" — it's a template email I customize in Outlook with their start date, first week schedule, parking info, dress code, all that. I also attach the benefits enrollment forms as PDFs. Takes about 15 minutes per person.

Agent: Then what needs to happen before their start date?

Employee: I submit an IT provisioning request through ServiceNow — laptop, email account, software licenses, badge access. That takes me about 10 minutes to fill out but IT usually takes 3-5 business days to fulfill it, so I need to do this at least a week before the start date. If I'm late, the new hire shows up with no equipment. Happened twice last month.

Agent: Any other coordination needed?

Employee: Yes, I coordinate with the hiring manager to set up the first week schedule — intro meetings, team lunch, training sessions. That's all done over Slack and Google Calendar. I also order any department-specific supplies through our procurement portal. And I set up their orientation session — we do group orientations every Monday.

Agent: How many new hires do you onboard per month?

Employee: Usually 15-20. Each one takes me about 3-4 hours total spread across the pre-boarding period. The worst part is tracking where each person is in the process — I use a Google Sheet with conditional formatting that I built myself because we don't have a proper onboarding tool.

Agent: What would you most want to automate?

Employee: The data entry between Greenhouse and Workday — hands down. And the IT provisioning request, since it's the same form every time with slightly different details. If those two things were automated I'd save probably 15 hours a month.`,
  },
  {
    label: "Engineering: Release Deployment",
    role: "Release Manager",
    department: "Engineering",
    workflowName: "Production Deployment",
    rawTranscript: `Agent: Can you walk me through what happens when you're doing a production deployment?

Employee: Sure. We do releases every two weeks, on Tuesdays. The process starts the Friday before when I create the release branch from main in GitHub.

Agent: What happens after the branch is created?

Employee: I run our release checklist — it's a template in Notion that I duplicate each time. About 30 items. I go through and verify that all the PRs tagged for this release are merged, the changelog is updated, and there are no blocking bugs in Jira.

Agent: How long does that verification take?

Employee: The checklist itself takes about an hour. But if there are issues — like a PR that's still in review or a bug that was supposed to be fixed — I have to track down the engineers on Slack. That coordination can add another 2-3 hours. Sometimes a feature gets pulled from the release last minute and I have to revert the merge. That's always stressful.

Agent: Once the checklist is clean, what's next?

Employee: Monday I trigger the staging deployment through our CI/CD pipeline in GitHub Actions. That builds, runs the full test suite, and deploys to our staging environment. The build itself takes about 45 minutes. If tests fail I need to diagnose and get fixes in — that's unpredictable, could be 30 minutes or half a day.

Agent: And the actual production deployment on Tuesday?

Employee: I send a deployment notification to the #releases Slack channel, run the production pipeline, and then monitor our Datadog dashboards for about an hour after deploy. I'm watching error rates, latency, and key business metrics. If anything spikes, I have to decide whether to roll back. We've rolled back maybe 3 times in the last 6 months.

Agent: What about post-deployment?

Employee: I update the release notes in Notion, close out the Jira tickets, notify stakeholders in Slack, and update our internal status page. Then I write a brief summary email to the VP of Engineering. The whole post-deploy admin takes about 45 minutes.

Agent: What's the most painful part?

Employee: Honestly, the Notion checklist is a nightmare. It's manual, things get missed, and I spend half my time just updating status fields. Also the coordination on Slack when things aren't ready — I wish there was a single dashboard showing release readiness instead of me pinging 10 people.`,
  },
  {
    label: "Marketing: Campaign Launch",
    role: "Marketing Manager",
    department: "Marketing",
    workflowName: "Campaign Launch Process",
    rawTranscript: `Agent: I'd love to understand your campaign launch process. What triggers a new campaign?

Employee: It usually starts in our quarterly planning meeting. We identify 3-4 major campaigns per quarter based on product launches, seasonal events, or strategic goals. I create a campaign brief in Google Docs and share it with stakeholders for input.

Agent: What goes into the brief?

Employee: Target audience, messaging themes, channels, budget, timeline, and KPIs. Writing it takes about 2 hours, but then getting feedback and approval from the VP of Marketing adds another week of back-and-forth in comments. She's thorough, which I appreciate, but it slows things down.

Agent: Once the brief is approved, what's next?

Employee: I create the campaign project in Asana with all the deliverables — landing pages, emails, social posts, paid ad creatives, blog content. Each deliverable becomes a task assigned to the relevant team member. Setting up the project template takes about 45 minutes.

Agent: Then the execution phase?

Employee: The creative team designs assets in Figma, the content team writes copy in Google Docs, and I review everything. This is where it gets chaotic. I'm constantly checking Asana for updates, giving feedback in Figma comments, reviewing copy in Google Docs, and coordinating timelines in Slack. There's no single place to see the full picture.

Agent: How do you handle the actual launch?

Employee: Launch day is intense. I schedule emails in HubSpot, publish landing pages in our CMS (we use Webflow), schedule social posts in Sprout Social, and activate paid campaigns in Google Ads and LinkedIn Campaign Manager. Each platform is separate so I'm logging into 5 different tools. If something goes wrong in one place it can cascade — like if the landing page isn't live when the email goes out.

Agent: What about tracking results?

Employee: After launch, I pull data from Google Analytics, HubSpot, and the ad platforms into a Google Sheet where I have a reporting template. I update it daily for the first week, then weekly. The report goes to leadership every Monday. Building that first report takes about 3 hours because I'm pulling from so many sources.

Agent: What's your biggest pain point in all of this?

Employee: The tool fragmentation. I spend at least 30% of my time just switching between platforms and manually moving information from one to another. And the reporting — I'd kill for automated dashboards instead of manually pulling numbers into spreadsheets every week.`,
  },
]
