// ═══ QUESTION_BANK — 85 AZ-500 Questions ═══
// mc×32, ms×15, order×12, match×10, yesno×10, blank×6
// NET×20, IDN×20, CMP×15, DFC×15, STR×15
// Difficulty: rookie×34, veteran×34, elite×17
// MC answer index distribution: ~8 per index (0/1/2/3)

const QUESTION_BANK = [

// ══════════════════════ NET — 20 QUESTIONS ══════════════════════

{
  id:'NET-1', domain:'NET', difficulty:'rookie', type:'mc',
  question:'An NSG rule at priority 100 allows traffic on port 80. A rule at priority 200 denies all traffic. Both match an HTTP request. What is the result?',
  options:[
    'Traffic is allowed — the lower priority number wins',
    'Traffic is denied — deny always overrides allow',
    'Both rules apply and the request is logged',
    'Azure blocks the traffic and raises an alert'
  ],
  answer:0,
  explanation:'NSG rules evaluate in ascending priority order. Priority 100 is checked before 200. The first matching rule wins, so the Allow at 100 takes effect. Azure does not have an implicit "deny overrides" behavior — order of priority is everything.'
},
{
  id:'NET-2', domain:'NET', difficulty:'rookie', type:'mc',
  question:'You need all VM outbound internet traffic routed through a Network Virtual Appliance (NVA). What do you configure?',
  options:[
    'An NSG outbound deny rule for 0.0.0.0/0 on the subnet',
    'A User Defined Route with next hop type Virtual Appliance pointing to the NVA IP',
    'Azure DDoS Protection Network plan on the VNet',
    'A service endpoint for Internet on the subnet'
  ],
  answer:1,
  explanation:'UDRs (route tables) override Azure system routes. Adding a 0.0.0.0/0 route with "Virtual appliance" next hop and the NVA\'s private IP forces all outbound traffic through the NVA. NSGs are stateful packet filters, not routers — they cannot redirect traffic.'
},
{
  id:'NET-3', domain:'NET', difficulty:'rookie', type:'mc',
  question:'What is the default action of an NSG when no rule matches inbound traffic from the internet to a VM?',
  options:[
    'Allow — Azure allows all internet traffic by default',
    'Log — traffic is logged but not blocked',
    'Deny — the implicit DenyAllInbound default rule blocks it',
    'Prompt — Azure asks the administrator to approve'
  ],
  answer:2,
  explanation:'Every NSG has three default rules that cannot be deleted: AllowVNetInbound (65000), AllowAzureLoadBalancerInbound (65001), and DenyAllInbound (65500). Internet traffic that matches no custom rule hits DenyAllInbound and is blocked. The VM will be unreachable from the internet unless you explicitly open a port.'
},
{
  id:'NET-4', domain:'NET', difficulty:'rookie', type:'mc',
  question:'Two VMs are in different subnets within the same VNet. There are no NSGs. Can they communicate?',
  options:[
    'No — VMs in different subnets are isolated by default',
    'No — you must configure VNet peering first',
    'Yes — Azure allows all traffic within a VNet by default',
    'Yes — but only if they share the same availability zone'
  ],
  answer:2,
  explanation:'Within a single VNet, all subnets can communicate by default. Azure inserts an AllowVNetInbound rule at priority 65000 in default NSGs. Without any NSG attached, traffic flows freely between subnets in the same VNet. NSGs must be explicitly applied to restrict intra-VNet traffic.'
},
{
  id:'NET-5', domain:'NET', difficulty:'veteran', type:'mc',
  question:'A Private Endpoint for Azure Key Vault is deployed in VNet-A. VNet-B is peered to VNet-A. VMs in VNet-B cannot resolve the Key Vault FQDN to the private IP. What is the most likely cause?',
  options:[
    'The Private Endpoint DNS zone is not linked to VNet-B',
    'VNet peering does not support Private Endpoints',
    'The Key Vault firewall must be disabled to use Private Endpoints',
    'Private Endpoints require a VPN gateway on both VNets'
  ],
  answer:0,
  explanation:'Private Endpoints rely on Azure Private DNS Zones for FQDN → private IP resolution. By default, the DNS zone is only linked to the VNet where the endpoint was created. VMs in VNet-B will resolve to the public IP unless you link the private DNS zone (privatelink.vaultcore.azure.net) to VNet-B, or configure a custom DNS forwarder.'
},
{
  id:'NET-6', domain:'NET', difficulty:'veteran', type:'mc',
  question:'You need to inspect and filter TLS-encrypted HTTPS traffic leaving your Azure VNet. Which Azure service supports TLS inspection natively?',
  options:[
    'Azure Firewall Premium',
    'Azure Application Gateway WAF',
    'Azure DDoS Protection Network Plan',
    'Azure Network Watcher'
  ],
  answer:0,
  explanation:'Azure Firewall Premium includes TLS inspection (SSL termination and re-encryption), IDPS, and URL filtering. It can decrypt HTTPS traffic, inspect it for threats, then re-encrypt and forward it. Application Gateway WAF inspects inbound HTTP/HTTPS but does not do egress TLS inspection. Network Watcher is a monitoring tool, not a security inspection tool.'
},
{
  id:'NET-7', domain:'NET', difficulty:'veteran', type:'mc',
  question:'Your VNet has DDoS Network Protection enabled. An attack on a protected public IP exceeds the threshold. What does Azure do automatically?',
  options:[
    'Shuts down the VM to prevent billing overages',
    'Blocks all inbound traffic to the VNet until you manually clear it',
    'Routes attack traffic through scrubbing centers and only forwards clean traffic',
    'Sends an alert but takes no automatic mitigation action'
  ],
  answer:2,
  explanation:'DDoS Network Protection uses traffic profiling and ML-based adaptive tuning. During an attack, it routes traffic through scrubbing centers that absorb and filter malicious traffic, forwarding only legitimate traffic to your resource. Mitigation is automatic and transparent. The free Basic tier offers infrastructure-level protection; the Network Protection tier adds per-resource adaptive tuning and SLA guarantees.'
},
{
  id:'NET-8', domain:'NET', difficulty:'elite', type:'mc',
  question:'Azure Firewall is deployed in a hub VNet. Spoke VNets are peered to the hub. VMs in spokes can reach the internet but bypass the Firewall. What configuration is missing?',
  options:[
    'Azure Firewall DNAT rules for outbound traffic',
    'Azure Bastion in each spoke VNet',
    'NSG rules on the hub subnet blocking direct internet access',
    'UDRs in each spoke subnet with 0.0.0.0/0 → Azure Firewall private IP as next hop'
  ],
  answer:3,
  explanation:'In a hub-and-spoke topology, spoke VMs can still reach the internet through their own direct routes unless you override them. You must add a route table (UDR) to each spoke subnet with a default route (0.0.0.0/0) pointing to the Azure Firewall\'s private IP. This forces all outbound traffic through the Firewall for inspection and policy enforcement. DNAT is for inbound traffic only.'
},
{
  id:'NET-9', domain:'NET', difficulty:'rookie', type:'ms',
  question:'Which of the following are valid NSG rule properties? (Select all that apply)',
  options:[
    'Source IP address or CIDR range',
    'Destination port range',
    'Protocol (TCP, UDP, ICMP, or Any)',
    'Priority number (100–4096)',
    'Time of day schedule'
  ],
  answers:[0,1,2,3],
  explanation:'NSG rules are defined by: source (IP/CIDR/service tag/ASG), destination (IP/CIDR/service tag/ASG), protocol (TCP/UDP/ICMP/Any), port range, priority (100-4096), and action (Allow/Deny). Time-based rules are not supported in NSGs — use Azure Firewall policies for time-based filtering.'
},
{
  id:'NET-10', domain:'NET', difficulty:'veteran', type:'ms',
  question:'Which statements about Azure Private Link and Private Endpoints are correct? (Select all that apply)',
  options:[
    'A Private Endpoint assigns a private IP from your VNet to a PaaS resource',
    'Private Link eliminates the need for service endpoints',
    'Traffic to the PaaS resource traverses the public internet when using a Private Endpoint',
    'The Private Endpoint requires a private DNS zone for correct FQDN resolution',
    'Private Endpoints can be used for custom services via Private Link Service'
  ],
  answers:[0,1,3,4],
  explanation:'A Private Endpoint injects a private IP from your VNet into the PaaS service network. Traffic stays entirely on the Microsoft backbone — no public internet. Private DNS Zones are required for FQDN resolution to the private IP. Private Link Service extends this to your own custom services. Service endpoints are an older, less secure approach that Private Link supersedes for most use cases.'
},
{
  id:'NET-11', domain:'NET', difficulty:'veteran', type:'ms',
  question:'Azure Firewall Standard supports which of the following rule types? (Select all that apply)',
  options:[
    'Network rules (L4 — IP, port, protocol)',
    'Application rules (L7 — FQDN, HTTP/HTTPS)',
    'DNAT rules (inbound port forwarding)',
    'TLS inspection rules',
    'IDPS signature-based rules'
  ],
  answers:[0,1,2],
  explanation:'Azure Firewall Standard has three rule types: Network rules (L4, IP/port/protocol), Application rules (L7, FQDN/HTTP category), and DNAT rules (inbound NAT). TLS inspection and IDPS are Premium-only features. Standard does have threat intelligence alerting/blocking but not full IDPS signatures.'
},
{
  id:'NET-12', domain:'NET', difficulty:'elite', type:'ms',
  question:'A zero-trust architecture for Azure workloads requires restricting lateral movement between VMs. Which controls should be implemented? (Select all that apply)',
  options:[
    'NSGs applied at the subnet level with explicit allow rules per service',
    'Application Security Groups to group VMs by role and create role-based NSG rules',
    'VNet peering between all VNets for full mesh connectivity',
    'Azure Defender for Servers on all VMs for threat detection',
    'JIT VM access to restrict management port exposure'
  ],
  answers:[0,1,3,4],
  explanation:'Zero trust requires explicit verification and least privilege. NSGs per subnet and ASGs for role-based rules implement microsegmentation. Defender for Servers provides threat detection. JIT removes persistent management port exposure. Full-mesh VNet peering actually increases lateral movement risk — it should be replaced with hub-and-spoke with firewall inspection.'
},
{
  id:'NET-13', domain:'NET', difficulty:'rookie', type:'order',
  question:'Put the steps in the correct order to create an NSG rule that allows HTTPS from the internet to a web server VM:',
  items:[
    'Navigate to Network Security Groups in the Azure portal',
    'Select the NSG associated with the VM or its subnet',
    'Click "Inbound security rules" then "+ Add"',
    'Set Source to "Any" or specific IP, destination port to 443, protocol TCP, action Allow',
    'Assign a priority number lower than any existing deny rules and click Add'
  ],
  explanation:'NSG rule creation follows this flow: find the NSG → inbound rules → Add → configure source/destination/port/protocol/action → set priority. Priority must be lower (numerically) than any blocking rule to ensure the allow fires first. The rule takes effect within seconds of saving.'
},
{
  id:'NET-14', domain:'NET', difficulty:'veteran', type:'order',
  question:'Put the steps in the correct order to route subnet traffic through Azure Firewall in a hub-and-spoke topology:',
  items:[
    'Deploy Azure Firewall in the hub VNet with a dedicated AzureFirewallSubnet',
    'Note the Azure Firewall private IP address',
    'Create a route table (UDR) with a default route 0.0.0.0/0 → Virtual Appliance → Firewall IP',
    'Associate the route table with the spoke VNet subnets',
    'Create Azure Firewall application/network rules to permit required outbound traffic'
  ],
  explanation:'The sequence: deploy Firewall → get its private IP → create UDR with default route to that IP → attach UDR to spoke subnets → configure rules. If you forget step 5, all outbound traffic will be blocked by default since Firewall denies unless explicitly allowed. Associating the UDR before creating rules causes an outage.'
},
{
  id:'NET-15', domain:'NET', difficulty:'elite', type:'order',
  question:'Put the steps in the correct order to deploy a Private Endpoint for Azure SQL with DNS resolution working correctly:',
  items:[
    'Create the Private Endpoint in the VNet, targeting the Azure SQL server',
    'In the Private Endpoint creation wizard, select "Yes" to integrate with private DNS zone',
    'Verify the private DNS zone privatelink.database.windows.net is created and linked to the VNet',
    'Test name resolution: nslookup server.database.windows.net should return the private IP',
    'Update the Azure SQL firewall to deny public network access'
  ],
  explanation:'Creating the endpoint with DNS integration auto-creates the privatelink DNS zone and A record. Always verify DNS resolution before updating firewall settings — if DNS is wrong and you block public access first, your application will immediately break. The "deny public access" step locks out the public endpoint so all traffic must use the private IP.'
},
{
  id:'NET-16', domain:'NET', difficulty:'veteran', type:'match',
  question:'Match each Azure network security control to its primary purpose:',
  pairs:[
    { left:'Network Security Group (NSG)',  right:'Layer 4 stateful packet filtering at subnet/NIC level' },
    { left:'Azure Firewall',                right:'Fully managed L4/L7 stateful firewall with FQDN filtering' },
    { left:'Application Gateway WAF',       right:'Inbound web application protection (OWASP rules)' },
    { left:'User Defined Route (UDR)',      right:'Override default Azure routing to steer traffic to an NVA' }
  ],
  explanation:'NSGs are subnet/NIC-level L4 filters. Azure Firewall is a managed NVA with FQDN, URL, and IDPS capabilities. Application Gateway WAF protects inbound HTTP/HTTPS using OWASP rule sets. UDRs modify routing tables to control traffic paths — required to force traffic through an NVA or Firewall.'
},
{
  id:'NET-17', domain:'NET', difficulty:'veteran', type:'match',
  question:'Match each network monitoring tool to what it captures:',
  pairs:[
    { left:'NSG Flow Logs',             right:'Allowed/denied flows per NSG rule with 5-tuple metadata' },
    { left:'VNet Flow Logs',            right:'All IP traffic in a VNet regardless of NSG association' },
    { left:'Connection Monitor',        right:'Probes synthetic TCP/ICMP connectivity end-to-end' },
    { left:'Network Watcher Packet Capture', right:'Full packet capture (PCAP) on a specific VM NIC' }
  ],
  explanation:'NSG Flow Logs record allowed/denied traffic per NSG rule. VNet Flow Logs (newer) capture all VNet traffic. Connection Monitor actively probes connectivity between endpoints. Packet Capture creates PCAP files for deep packet inspection. All are accessed through Azure Network Watcher.'
},
{
  id:'NET-18', domain:'NET', difficulty:'rookie', type:'yesno',
  stem:'Network Security Groups — True or False?',
  question:'Review these statements about NSG behavior:',
  statements:[
    { text:'An NSG can be associated with both a subnet and a NIC simultaneously; both are evaluated', answer:true },
    { text:'NSG rules apply to all traffic including traffic originating from Azure platform services', answer:false },
    { text:'Service tags like "Internet" or "AzureLoadBalancer" can be used as NSG source/destination', answer:true }
  ],
  explanation:'NSGs can be applied at both subnet and NIC levels — both are evaluated (subnet NSG first for inbound, NIC NSG first for outbound). Platform services like Azure Load Balancer health probes are represented by the "AzureLoadBalancer" service tag and bypass deny-all rules by default via AllowAzureLoadBalancerInbound. Service tags simplify rules by abstracting Azure service IP ranges.'
},
{
  id:'NET-19', domain:'NET', difficulty:'rookie', type:'yesno',
  stem:'Azure VNet Peering — True or False?',
  question:'Review these statements about VNet peering:',
  statements:[
    { text:'VNet peering is transitive — peering A-B and B-C means A can reach C by default', answer:false },
    { text:'Peered VNets must be in the same Azure region', answer:false },
    { text:'You can peer VNets across different Azure subscriptions and tenants', answer:true }
  ],
  explanation:'VNet peering is NOT transitive. If A peers to B and B peers to C, A cannot reach C without a direct peering or using Azure Firewall/NVA as a transit hub. Global VNet peering supports cross-region, and cross-subscription/tenant peering is supported with appropriate RBAC permissions on both VNets.'
},
{
  id:'NET-20', domain:'NET', difficulty:'elite', type:'blank',
  question:'Complete these facts about Azure Firewall threat intelligence:',
  template:'Azure Firewall threat intelligence uses ___[0]___ to identify known malicious IPs and domains. When set to ___[1]___ mode, matching traffic is blocked and logged. The feed is sourced from ___[2]___.',
  blanks:[
    { options:['Microsoft Threat Intelligence Feed','OWASP ModSecurity CRS','Snort rules','VirusTotal API'], answer:0 },
    { options:['Alert and Deny','Audit Only','Monitor','Passive'], answer:0 },
    { options:['Microsoft Cyber Defense Operations Center','Open source OSINT feeds','Azure Sentinel only','MITRE ATT&CK'], answer:0 }
  ],
  explanation:'Azure Firewall Threat Intelligence uses Microsoft\'s own threat feed (maintained by MDTI). In "Alert and Deny" mode, traffic to/from known bad IPs/FQDNs is blocked and an alert is logged. In "Alert only" mode it logs but allows. The feed updates automatically — no manual signature updates required.'
},

// ══════════════════════ IDN — 20 QUESTIONS ══════════════════════

{
  id:'IDN-1', domain:'IDN', difficulty:'rookie', type:'mc',
  question:'A user has an "Eligible" PIM assignment for Global Administrator. What must happen before the role is active?',
  options:[
    'The user must self-activate the role with justification and optionally MFA or approval',
    'A Global Admin must permanently promote the user each morning',
    'The role activates automatically during business hours',
    'The user must first enable SSPR on their account'
  ],
  answer:0,
  explanation:'PIM Eligible assignments are not active by default. The user must navigate to PIM, find the role, and activate it — providing MFA proof, business justification, and/or an approval request depending on the policy. The role is active for a bounded duration (e.g., 1-8 hours) then automatically deactivates. This is Just-In-Time access.'
},
{
  id:'IDN-2', domain:'IDN', difficulty:'rookie', type:'mc',
  question:'A Conditional Access policy requires compliant devices. A user logs in from a personal unregistered phone. What happens?',
  options:[
    'The user receives an MFA prompt to compensate for the unregistered device',
    'Access is granted because Conditional Access only applies to managed devices',
    'Access is blocked until the device is enrolled in Intune',
    'Azure AD disables the user account for using an unauthorized device'
  ],
  answer:2,
  explanation:'When a CA policy requires "Compliant device" or "Hybrid Azure AD joined device" as a grant control, access is blocked if the device doesn\'t meet the condition. The user would need to enroll the device in Intune (for compliance) or use a compliant device. CA evaluates device state at sign-in time using signals from the device token.'
},
{
  id:'IDN-3', domain:'IDN', difficulty:'rookie', type:'mc',
  question:'What is a system-assigned managed identity in Azure?',
  options:[
    'An identity created in Azure AD and tied to a specific Azure resource lifecycle',
    'A service account stored in Azure Key Vault for use by applications',
    'A shared identity used by multiple Azure services in a subscription',
    'A federation trust between Azure AD and an on-premises Active Directory'
  ],
  answer:0,
  explanation:'A system-assigned managed identity is automatically created in Azure AD and bound to a specific resource (e.g., a VM or Function App). Its lifecycle is tied to the resource — when you delete the resource, the identity is deleted. It cannot be shared across resources. The application uses IMDS (Instance Metadata Service) to get tokens — no stored credentials needed.'
},
{
  id:'IDN-4', domain:'IDN', difficulty:'rookie', type:'mc',
  question:'Which RBAC scope is the broadest — meaning a role assignment here applies to all resources within it?',
  options:[
    'Resource group scope',
    'Resource scope',
    'Subscription scope',
    'Management group scope'
  ],
  answer:3,
  explanation:'RBAC scope hierarchy (broadest to narrowest): Management Group → Subscription → Resource Group → Resource. An assignment at management group scope propagates down to all subscriptions, resource groups, and resources within that management group. This is used for enterprise-wide policy enforcement.'
},
{
  id:'IDN-5', domain:'IDN', difficulty:'veteran', type:'mc',
  question:'An application needs to authenticate to Azure AD without a user being present. It cannot use managed identities. What credential type should you configure?',
  options:[
    'A client certificate or client secret for a service principal (app registration)',
    'A user account with MFA disabled for the application',
    'A PIM eligible assignment for the application',
    'A shared access signature from Azure Storage'
  ],
  answer:0,
  explanation:'For daemon/background apps that authenticate without a user, you register an application in Azure AD (creating a service principal) and configure either a client secret or certificate credential. Certificate credentials are preferred — they are more secure than secrets since the private key never leaves your environment. Client secrets expire and must be rotated manually.'
},
{
  id:'IDN-6', domain:'IDN', difficulty:'veteran', type:'mc',
  question:'You assign the "Reader" role to a security group at the subscription scope. A user in that group is also assigned "Owner" at a specific resource group within that subscription. What is the effective access?',
  options:[
    'Reader only — the more restrictive role applies',
    'Neither role applies — conflicting assignments cancel each other out',
    'Reader everywhere — subscription-level assignments override resource group assignments',
    'Owner at the resource group; Reader everywhere else in the subscription'
  ],
  answer:3,
  explanation:'Azure RBAC uses an additive model. Assignments at different scopes are combined — a user gets the union of all roles assigned at any scope in the hierarchy. There is no "override" — both assignments apply independently. The user has Owner permissions within that specific resource group and Reader permissions elsewhere in the subscription.'
},
{
  id:'IDN-7', domain:'IDN', difficulty:'veteran', type:'mc',
  question:'Azure AD B2B is being used to collaborate with a partner organization. What type of account is created in your tenant when the partner user accepts the invitation?',
  options:[
    'A full member account with the same privileges as internal users',
    'A shadow account synced from the partner\'s Active Directory',
    'A guest account (UserType = Guest) with limited default permissions',
    'A federated service principal linked to the partner tenant'
  ],
  answer:2,
  explanation:'Azure AD B2B creates a Guest account (UserType = "Guest") in your home tenant. Guest users have limited default permissions — they cannot enumerate all users/groups in the directory by default (controlled by external collaboration settings). They authenticate against their home tenant; your tenant only stores the guest object and trusts the home tenant\'s authentication.'
},
{
  id:'IDN-8', domain:'IDN', difficulty:'elite', type:'mc',
  question:'AKS workload identity is configured. The pod\'s service account is annotated with the managed identity client ID. Authentication to Azure AD still fails. Which component is most likely misconfigured?',
  options:[
    'The pod is using the wrong container image',
    'The service account namespace was not added to the managed identity tags',
    'The AKS cluster does not have network policies enabled',
    'The managed identity does not have the OIDC issuer URL configured as a federated identity credential'
  ],
  answer:3,
  explanation:'Workload identity uses federated identity credentials to establish trust between the Kubernetes service account token (issued by the AKS OIDC issuer) and the Azure AD managed identity. Without a federated identity credential on the managed identity that references the cluster\'s OIDC issuer URL, namespace, and service account name, the token exchange will fail. The OIDC issuer URL must be enabled on the cluster and match the federated credential.'
},
{
  id:'IDN-9', domain:'IDN', difficulty:'rookie', type:'ms',
  question:'Which Conditional Access conditions can be used to target a policy? (Select all that apply)',
  options:[
    'User or group assignment',
    'Cloud apps or actions being accessed',
    'Sign-in risk level (from Identity Protection)',
    'Time of day / business hours',
    'Device platform (iOS, Android, Windows)'
  ],
  answers:[0,1,2,4],
  explanation:'Conditional Access conditions include: users/groups, cloud apps/actions, sign-in risk (from Identity Protection), user risk, device platform, location (named locations), client apps, and device state. Time-of-day scheduling is NOT a native CA condition — you cannot restrict access to business hours natively in CA without additional tooling.'
},
{
  id:'IDN-10', domain:'IDN', difficulty:'veteran', type:'ms',
  question:'Which statements about Azure AD Privileged Identity Management (PIM) are correct? (Select all that apply)',
  options:[
    'PIM provides just-in-time access with bounded activation duration',
    'PIM requires Azure AD Premium P2 licensing',
    'PIM access reviews can automatically remove stale role assignments',
    'PIM supports both Azure AD roles and Azure resource RBAC roles',
    'PIM activations are always immediate with no approval required'
  ],
  answers:[0,1,2,3],
  explanation:'PIM provides JIT access (eligible assignments activated on-demand for a limited duration), requires P2 licensing, includes access reviews that can auto-revoke stale assignments, and supports both Azure AD directory roles and Azure resource roles. Approval workflows are configurable — activations can require manager or designated approver approval before becoming active.'
},
{
  id:'IDN-11', domain:'IDN', difficulty:'veteran', type:'ms',
  question:'Which Azure AD built-in RBAC roles should be assigned to allow a security team to READ security settings without making changes? (Select all that apply)',
  options:[
    'Security Reader',
    'Global Reader',
    'Security Operator',
    'Compliance Manager',
    'Security Administrator'
  ],
  answers:[0,1],
  explanation:'Security Reader grants read-only access to security-related features (Identity Protection, PIM, Compliance center). Global Reader is the read-only equivalent of Global Administrator — it can read almost all settings. Security Operator can manage security alerts (it\'s semi-active). Compliance Manager is for data governance. Security Administrator has full write access to security settings.'
},
{
  id:'IDN-12', domain:'IDN', difficulty:'elite', type:'ms',
  question:'Which identity security controls directly reduce the risk of a compromised privileged account? (Select all that apply)',
  options:[
    'Enforcing MFA for all privileged role activations in PIM',
    'Enabling Identity Protection\'s risky sign-in Conditional Access policy',
    'Requiring hybrid Azure AD join for all endpoint devices',
    'Configuring PIM to require approval for Global Administrator activation',
    'Enabling Microsoft Entra Privileged Access Workstations (PAW) guidance'
  ],
  answers:[0,1,3,4],
  explanation:'MFA in PIM adds a second factor before privilege elevation. Identity Protection CA policies block or require step-up auth on risky sign-ins. Approval workflows in PIM ensure a human reviews every privilege escalation request. PAWs (secure admin workstations) isolate privileged tasks from everyday browsing. Hybrid Azure AD join is a device management control but doesn\'t directly protect privileged accounts if attackers pivot from a domain-joined machine.'
},
{
  id:'IDN-13', domain:'IDN', difficulty:'rookie', type:'order',
  question:'Put the steps in the correct order to activate a PIM eligible role:',
  items:[
    'Sign in to the Azure portal and navigate to Azure AD Privileged Identity Management',
    'Click "My roles" and select "Azure AD roles" or "Azure resources"',
    'Find the eligible role and click "Activate"',
    'Enter the activation duration and a business justification',
    'Complete MFA if required by the role policy'
  ],
  explanation:'PIM activation: navigate to PIM → My roles → find eligible role → Activate → provide duration + justification → satisfy MFA/approval policy. The role becomes active once approved or immediately if no approval is required. It auto-deactivates after the duration expires.'
},
{
  id:'IDN-14', domain:'IDN', difficulty:'veteran', type:'order',
  question:'Put the steps in the correct order to create a Conditional Access policy blocking legacy authentication:',
  items:[
    'Navigate to Azure AD → Security → Conditional Access',
    'Create a new policy and assign it to All Users',
    'Under "Cloud apps or actions", select "All cloud apps"',
    'Under "Conditions → Client apps", select legacy authentication clients (Exchange ActiveSync, other clients)',
    'Set Grant to "Block access" and enable the policy'
  ],
  explanation:'To block legacy auth (which bypasses MFA): target All Users, All apps, then in Conditions → Client apps enable legacy authentication clients. Set Grant = Block. Legacy clients include SMTP AUTH, POP3, IMAP, and Exchange ActiveSync clients that don\'t support modern auth. Blocking them prevents password spray attacks that exploit these protocols.'
},
{
  id:'IDN-15', domain:'IDN', difficulty:'elite', type:'order',
  question:'Put the steps in the correct order to configure AKS workload identity for a pod:',
  items:[
    'Enable OIDC issuer URL on the AKS cluster',
    'Create a user-assigned managed identity in Azure AD',
    'Create a federated identity credential on the managed identity referencing the cluster OIDC issuer, namespace, and service account name',
    'Annotate the Kubernetes ServiceAccount with azure.workload.identity/client-id',
    'Add the azure.workload.identity/use: "true" label to the pod spec'
  ],
  explanation:'Workload identity setup: (1) enable OIDC issuer so the cluster can issue trusted tokens, (2) create the managed identity that will have Azure permissions, (3) create the federated credential that tells Azure AD to trust K8s tokens from this specific cluster/namespace/SA, (4) annotate the K8s service account so the webhook knows which identity to use, (5) label pods to inject the projected token and env vars. Missing any step breaks the token exchange.'
},
{
  id:'IDN-16', domain:'IDN', difficulty:'veteran', type:'match',
  question:'Match each identity concept to its correct description:',
  pairs:[
    { left:'Managed Identity',         right:'Automatically managed credential for Azure resources — no stored secrets' },
    { left:'Service Principal',        right:'Security identity for applications and automation; can use secret or certificate' },
    { left:'Azure AD B2B Guest',       right:'External user who authenticates with their home tenant identity' },
    { left:'Conditional Access Policy',right:'Real-time policy engine that grants/blocks/step-ups access based on signals' }
  ],
  explanation:'Managed identities eliminate credential management (no secrets to rotate). Service principals are application identities requiring a secret or certificate. B2B guests use their own organization\'s credentials to access your tenant resources. Conditional Access is the policy enforcement point for all access decisions, evaluating user, device, location, and risk signals.'
},
{
  id:'IDN-17', domain:'IDN', difficulty:'veteran', type:'match',
  question:'Match each RBAC role to its permission scope:',
  pairs:[
    { left:'Owner',              right:'Full access including the ability to assign RBAC roles to others' },
    { left:'Contributor',        right:'Create and manage resources; cannot grant access to others' },
    { left:'User Access Administrator', right:'Manage user access only; cannot manage resources' },
    { left:'Reader',             right:'View existing resources; no create, update, or delete' }
  ],
  explanation:'Owner = Contributor + User Access Administrator. Contributor can create/delete/manage resources but cannot assign roles. User Access Administrator can only manage access (role assignments) without resource management rights. Reader is read-only. Separate Owner and Contributor for developers — granting Contributor prevents them from escalating their own permissions.'
},
{
  id:'IDN-18', domain:'IDN', difficulty:'rookie', type:'yesno',
  stem:'Managed Identities — True or False?',
  question:'Review these statements about Azure managed identities:',
  statements:[
    { text:'A user-assigned managed identity can be assigned to multiple Azure resources simultaneously', answer:true },
    { text:'System-assigned managed identity credentials can be exported and used outside of Azure', answer:false },
    { text:'Managed identities use Azure Instance Metadata Service (IMDS) to obtain access tokens', answer:true }
  ],
  explanation:'User-assigned managed identities are standalone resources that can be attached to multiple VMs, Function Apps, etc. System-assigned identities are internal — their credentials are managed entirely by Azure and cannot be exported or used outside the resource. Both types obtain access tokens by calling the IMDS endpoint (169.254.169.254) from within the Azure resource.'
},
{
  id:'IDN-19', domain:'IDN', difficulty:'rookie', type:'yesno',
  stem:'Azure AD Password Policies — True or False?',
  question:'Review these statements about Azure AD authentication controls:',
  statements:[
    { text:'Azure AD enforces password expiration for cloud-only accounts by default', answer:false },
    { text:'Self-Service Password Reset (SSPR) can be scoped to a specific Azure AD group', answer:true },
    { text:'Azure AD Smart Lockout protects against brute force by locking accounts after failed attempts', answer:true }
  ],
  explanation:'Cloud-only Azure AD passwords do NOT expire by default — this is different from on-premises AD. Password expiration policies can be configured but are off by default. SSPR supports All users or a specific group scope (group-scoped SSPR). Smart Lockout uses AI to distinguish legitimate users from attackers, locking accounts based on unusual patterns while allowing legitimate users to continue.'
},
{
  id:'IDN-20', domain:'IDN', difficulty:'elite', type:'blank',
  question:'Complete these facts about Conditional Access evaluation:',
  template:'Conditional Access is enforced at the ___[0]___ after authentication. When a policy targets a sign-in risk of "High", Azure AD ___[1]___ calls Identity Protection\'s risk engine. A CA policy can be set to ___[2]___ mode to evaluate but not enforce, which is useful for impact analysis.',
  blanks:[
    { options:['token issuance point','network firewall','LDAP directory','DNS resolver'], answer:0 },
    { options:['automatically','only on mobile devices','manually via PowerShell','weekly in batch'], answer:0 },
    { options:['Report-only','Read-only','Shadow','Disabled'], answer:0 }
  ],
  explanation:'CA is evaluated at token issuance — after primary authentication, before the access token is issued. Sign-in risk conditions consume Identity Protection signals in real time. Report-only mode is critical for testing: it evaluates the policy against all sign-ins and logs what would have happened without actually blocking anyone, letting you predict the impact before enforcing.'
},

// ══════════════════════ CMP — 15 QUESTIONS ══════════════════════

{
  id:'CMP-1', domain:'CMP', difficulty:'rookie', type:'mc',
  question:'JIT VM access is enabled. A developer requests SSH access to a Linux VM for 2 hours. What does Azure automatically create?',
  options:[
    'An inbound NSG rule allowing TCP 22 from the developer\'s source IP for 2 hours',
    'A new public IP address assigned to the VM for 2 hours',
    'A VPN connection from the developer\'s machine to the VM',
    'A bastion host in the VM\'s VNet temporarily'
  ],
  answer:0,
  explanation:'JIT VM Access creates a time-bound NSG inbound rule. The rule allows only the specific port (22/SSH, 3389/RDP) from the requester\'s specific source IP for the requested duration. After the time window, the rule is automatically deleted. This drastically reduces exposure of management ports compared to leaving them always-open.'
},
{
  id:'CMP-2', domain:'CMP', difficulty:'rookie', type:'mc',
  question:'What does Azure Policy "Audit" effect do when a non-compliant resource is found?',
  options:[
    'Blocks creation of the resource with an error message',
    'Creates a compliance record and flags the resource in Defender for Cloud — but does not block it',
    'Automatically remediates the resource to make it compliant',
    'Sends an email to the subscription owner'
  ],
  answer:1,
  explanation:'"Audit" evaluates resources against the policy rule and marks non-compliant ones in the compliance dashboard. It does NOT prevent resource creation or modification — it only creates visibility. Use "Deny" to block, "DeployIfNotExists" or "Modify" for automatic remediation. Audit is ideal for initial assessment before enforcing a policy.'
},
{
  id:'CMP-3', domain:'CMP', difficulty:'veteran', type:'mc',
  question:'Defender for Servers Plan 2 is enabled. Which capability is available in Plan 2 but NOT in Plan 1?',
  options:[
    'Integration with Microsoft Defender Antivirus',
    'Defender for Endpoint integration',
    'Security alerts for process creation and network connections',
    'File Integrity Monitoring (FIM) and adaptive application controls'
  ],
  answer:3,
  explanation:'Defender for Servers Plan 2 includes everything in Plan 1 plus: File Integrity Monitoring (tracks changes to OS files and registry), Adaptive Application Controls (ML-based allowlisting recommendations), and 500 MB/day of free Log Analytics data ingestion per server. Plan 1 includes Defender for Endpoint integration and basic threat detection.'
},
{
  id:'CMP-4', domain:'CMP', difficulty:'veteran', type:'mc',
  question:'Azure Disk Encryption (ADE) and encryption at host are both options for protecting VM disk data. What is a key difference?',
  options:[
    'ADE encrypts the VM\'s OS disk; encryption at host encrypts only data disks',
    'ADE and encryption at host can be used simultaneously on the same VM',
    'Encryption at host requires no key management; ADE requires Key Vault',
    'ADE encrypts within the OS using BitLocker/DM-Crypt; encryption at host encrypts at the hypervisor level before data leaves the host'
  ],
  answer:3,
  explanation:'ADE uses BitLocker (Windows) or DM-Crypt (Linux) inside the guest OS to encrypt disks; keys are stored in Key Vault. Encryption at host encrypts the data at the physical host level before it reaches Azure Storage — it also covers temp disks and disk caches which ADE misses. The two are mutually exclusive on the same VM. Encryption at host also requires Key Vault for CMK (Customer Managed Keys).'
},
{
  id:'CMP-5', domain:'CMP', difficulty:'veteran', type:'mc',
  question:'Azure Secure Score measures your security posture. What does a higher Secure Score indicate?',
  options:[
    'Your subscription has zero active security alerts',
    'A greater percentage of security recommendations have been implemented',
    'All VMs have Defender for Servers enabled',
    'Your compliance against a specific regulatory standard is high'
  ],
  answer:1,
  explanation:'Secure Score reflects what percentage of security recommendations have been completed. It is NOT a measure of zero alerts (alerts are threat detections, not posture gaps). It does NOT require all Defender plans (that\'s workload protection). Regulatory compliance is a separate dashboard. Higher score = more recommendations addressed = better posture.'
},
{
  id:'CMP-6', domain:'CMP', difficulty:'elite', type:'mc',
  question:'You are configuring vulnerability assessment for Azure VMs using Defender for Servers. Which integrated scanner is available at no additional cost with Plan 2?',
  options:[
    'Rapid7 InsightVM (requires separate license)',
    'Qualys (requires Azure Marketplace subscription)',
    'Tenable Nessus (requires separate license)',
    'Microsoft Defender Vulnerability Management (built-in, no extra cost)'
  ],
  answer:3,
  explanation:'Defender for Servers Plan 2 includes Microsoft Defender Vulnerability Management (MDVM) as a built-in scanner at no extra cost. It discovers installed software, missing patches, and misconfigurations. Qualys and Rapid7 are also available as integrated options but require their own licensing. MDVM provides agentless scanning as well as agent-based assessment.'
},
{
  id:'CMP-7', domain:'CMP', difficulty:'rookie', type:'ms',
  question:'Which capabilities does Just-In-Time VM Access provide? (Select all that apply)',
  options:[
    'Time-bound NSG rules that automatically expire after the requested duration',
    'Source IP restriction so only the requester\'s IP is allowed',
    'Audit log of who requested access, when, and from which IP',
    'Automatic OS patching during the access window',
    'Multi-factor authentication enforcement for VM login'
  ],
  answers:[0,1,2],
  explanation:'JIT VM Access creates time-bound, source-IP-restricted NSG rules and logs all access requests in the activity log. It does NOT patch the OS or enforce MFA for the OS login itself — those are separate controls. The audit trail is critical for compliance: you can see who requested access, approved it, the duration, and the source IP.'
},
{
  id:'CMP-8', domain:'CMP', difficulty:'veteran', type:'ms',
  question:'Azure Policy "DeployIfNotExists" effect can be used to automatically remediate non-compliant resources. In which scenarios is this appropriate? (Select all that apply)',
  options:[
    'Automatically installing the Log Analytics agent on VMs missing it',
    'Automatically adding a network security group to subnets without one',
    'Blocking users from creating VM sizes not in an approved list',
    'Enabling diagnostic settings on resources that have them disabled',
    'Automatically deleting resources tagged for removal'
  ],
  answers:[0,1,3],
  explanation:'"DeployIfNotExists" (DINE) deploys a related resource if the specified one doesn\'t exist. Common uses: deploying agents to VMs, adding NSGs to subnets, enabling diagnostics. For blocking, use "Deny". For tagging/property modifications, use "Modify". Auto-deletion requires a custom runbook or Logic App — DINE deploys, it doesn\'t delete.'
},
{
  id:'CMP-9', domain:'CMP', difficulty:'elite', type:'ms',
  question:'Which Azure Secure Score recommendations, if remediated, would provide the highest security value for virtual machines? (Select all that apply)',
  options:[
    'Enable Just-In-Time VM access on all internet-exposed management ports',
    'Apply system updates to machines',
    'Add a personal account as a subscription co-owner',
    'Enable endpoint protection on machines',
    'Encrypt VM disks'
  ],
  answers:[0,1,3,4],
  explanation:'Secure Score recommendations are weighted by impact. High-value VM hardening recommendations include JIT (reduces management port exposure), system updates (patches critical CVEs), endpoint protection (Defender for Servers/antimalware), and disk encryption (protects data at rest). Adding personal accounts as co-owners violates least privilege and is a Secure Score negative factor.'
},
{
  id:'CMP-10', domain:'CMP', difficulty:'rookie', type:'order',
  question:'Put the steps in the correct order to enable JIT VM access for a VM:',
  items:[
    'Navigate to Microsoft Defender for Cloud in the Azure portal',
    'Go to Workload protections → Just-in-time VM access',
    'Select the VM and click "Enable JIT on VM"',
    'Review the default port configuration (22, 3389, 5985, 5986) and customize if needed',
    'Click "Save" to apply the JIT policy'
  ],
  explanation:'JIT is configured through Defender for Cloud, not directly through VMs or NSGs. After enabling, the VM\'s NSG is modified to deny the management ports. Users then request access through Defender for Cloud, which creates a time-bound allow rule. The ports 22 (SSH), 3389 (RDP), 5985/5986 (WinRM) are the defaults.'
},
{
  id:'CMP-11', domain:'CMP', difficulty:'veteran', type:'order',
  question:'Put the steps in the correct order to assign an Azure Policy "Deny" effect to enforce a VM SKU allowlist:',
  items:[
    'Navigate to Azure Policy in the portal and select Definitions',
    'Find or create the "Allowed virtual machine size SKUs" built-in policy',
    'Click "Assign" and select the scope (subscription or management group)',
    'In the Parameters tab, specify the allowed VM SKU list',
    'Set the enforcement mode to "Enabled" and click "Review + create"'
  ],
  explanation:'Policy assignment: find the policy definition → click Assign → set scope → configure parameters (the allowed SKU list in this case) → set enforcement mode. "Enabled" blocks non-compliant operations. "Disabled" (or DoNotEnforce) runs in audit mode. Assigning at management group scope covers all child subscriptions automatically.'
},
{
  id:'CMP-12', domain:'CMP', difficulty:'veteran', type:'match',
  question:'Match each Defender for Cloud feature to its category:',
  pairs:[
    { left:'Secure Score',            right:'Posture management — measures recommendation completion' },
    { left:'Defender for Servers',    right:'Workload protection — threat detection for VMs' },
    { left:'Regulatory Compliance',   right:'Compliance — maps controls to standards like CIS/PCI-DSS' },
    { left:'Adaptive Network Hardening', right:'Recommendation — suggests tighter NSG rules based on traffic patterns' }
  ],
  explanation:'Defender for Cloud combines CSPM (Secure Score, Regulatory Compliance) and CWPP (Defender plans). Adaptive Network Hardening is a ML-based CSPM recommendation that analyzes actual traffic to suggest stricter NSG rules without disrupting operations. It\'s not automatic enforcement — it generates recommendations you review and apply.'
},
{
  id:'CMP-13', domain:'CMP', difficulty:'elite', type:'match',
  question:'Match each disk encryption approach to its key characteristic:',
  pairs:[
    { left:'Azure Disk Encryption (ADE)', right:'Guest OS-level encryption using BitLocker or DM-Crypt' },
    { left:'Encryption at host',          right:'Hypervisor-level encryption including temp disks and caches' },
    { left:'Server-side encryption (SSE)',right:'Azure Storage-level encryption at rest (always on by default)' },
    { left:'Confidential disk encryption',right:'Hardware-based TEE (Trusted Execution Environment) encryption' }
  ],
  explanation:'SSE is always-on Azure Storage encryption — every disk is encrypted at rest by default with platform keys. ADE adds OS-level encryption with customer-managed keys in Key Vault. Encryption at host extends coverage to temp disks and the disk cache layer between VM and storage. Confidential disk encryption uses AMD SEV-SNP hardware TEE for ultra-sensitive workloads.'
},
{
  id:'CMP-14', domain:'CMP', difficulty:'rookie', type:'yesno',
  stem:'Defender for Servers — True or False?',
  question:'Review these statements about Defender for Servers:',
  statements:[
    { text:'Defender for Servers Plan 1 includes Microsoft Defender for Endpoint (MDE) integration', answer:true },
    { text:'Enabling Defender for Servers automatically installs agents on all VMs without any configuration', answer:false },
    { text:'Defender for Servers provides threat detection alerts for Linux VMs as well as Windows', answer:true }
  ],
  explanation:'Plan 1 includes MDE integration for EDR capabilities. Auto-provisioning of agents (MMA/AMA) requires enabling it in Defender for Cloud settings — it is opt-in, not automatic. Defender for Servers uses behavioral analytics and threat intelligence for both Windows and Linux, detecting process injection, reverse shells, malicious scripts, and more.'
},
{
  id:'CMP-15', domain:'CMP', difficulty:'rookie', type:'yesno',
  stem:'Azure Policy Effects — True or False?',
  question:'Review these statements about Azure Policy:',
  statements:[
    { text:'The "Deny" effect prevents resource creation or modification that violates the policy rule', answer:true },
    { text:'Policies with "Audit" effect block resource deployment silently', answer:false },
    { text:'A policy initiative (set) groups multiple policy definitions for easier assignment', answer:true }
  ],
  explanation:'Deny blocks the operation with an error. Audit only records non-compliance — it never blocks. Policy initiatives (also called policy sets) bundle related policies together; you assign one initiative instead of dozens of individual policies. Built-in initiatives like "Azure Security Benchmark" contain 200+ policies for comprehensive coverage.'
},

// ══════════════════════ DFC — 15 QUESTIONS ══════════════════════

{
  id:'DFC-1', domain:'DFC', difficulty:'rookie', type:'mc',
  question:'What is the difference between CSPM and CWPP in Microsoft Defender for Cloud?',
  options:[
    'CSPM manages identities; CWPP manages network security rules',
    'CSPM is for on-premises only; CWPP is for cloud workloads',
    'CSPM assesses security posture and provides recommendations; CWPP provides runtime workload threat protection',
    'CSPM is free; CWPP requires a third-party license'
  ],
  answer:2,
  explanation:'CSPM (Cloud Security Posture Management) continuously evaluates resource configurations against security best practices, generating Secure Score and compliance reports. CWPP (Cloud Workload Protection Platform) are the paid Defender plans that provide real-time threat detection per workload type (servers, containers, databases, storage, etc.). You can use CSPM without CWPP, but not vice versa.'
},
{
  id:'DFC-2', domain:'DFC', difficulty:'rookie', type:'mc',
  question:'A Defender for Cloud security alert fires for "Unusual process execution on VM." What should you do first?',
  options:[
    'Immediately delete the VM to prevent further damage',
    'Investigate the alert details, affected resource, and MITRE ATT&CK mapping before taking action',
    'Disable Defender for Servers to stop the false positives',
    'Reset the subscription\'s Access Control policies'
  ],
  answer:1,
  explanation:'Security response starts with investigation: read the alert description, affected entity, evidence (process tree, network connections), MITRE tactic/technique mapping, and recommended remediation steps. Immediately deleting a VM may destroy forensic evidence and disrupt production. Never disable security tools based on a single alert. Always investigate before acting.'
},
{
  id:'DFC-3', domain:'DFC', difficulty:'veteran', type:'mc',
  question:'You want to grant an application read-only access to secrets in a Key Vault using the new RBAC authorization model. Which role should you assign?',
  options:[
    'Key Vault Administrator',
    'Key Vault Secrets Officer',
    'Key Vault Secrets User',
    'Key Vault Reader'
  ],
  answer:2,
  explanation:'"Key Vault Secrets User" grants Get and List on secrets — exactly what an application needs to retrieve secret values. "Secrets Officer" allows Create, Delete, and Update (too much privilege). "Key Vault Reader" reads vault metadata (name, properties) but NOT secret values. "Key Vault Administrator" has full control including managing access policies and purge protection.'
},
{
  id:'DFC-4', domain:'DFC', difficulty:'veteran', type:'mc',
  question:'Microsoft Sentinel is connected to your Log Analytics workspace. You want to correlate multiple low-severity alerts from different sources into a single incident. What should you configure?',
  options:[
    'A Workbook to visualize the alert trends',
    'A Fusion ML analytics rule or a Scheduled analytics rule to group related alerts',
    'A Playbook (Logic App) to manually merge alerts',
    'An Azure Monitor alert rule on the SecurityAlert table'
  ],
  answer:1,
  explanation:'Analytics rules in Sentinel create incidents from alerts. Scheduled rules use KQL to query logs on a schedule and group matching events. Fusion rules use ML to correlate multi-stage attacks across different data sources automatically. Workbooks are for visualization only. Playbooks automate response to existing incidents — they don\'t create incidents.'
},
{
  id:'DFC-5', domain:'DFC', difficulty:'elite', type:'mc',
  question:'Azure Key Vault Soft Delete is enabled with a 90-day retention period. An administrator accidentally runs "az keyvault delete". What is the state of the vault?',
  options:[
    'In a soft-deleted state recoverable with "az keyvault recover" within 90 days',
    'Automatically restored by Azure after 24 hours',
    'Permanently deleted — soft delete only applies to secrets, not the vault itself',
    'Moved to the subscription recycle bin for 30 days'
  ],
  answer:0,
  explanation:'Key Vault soft delete protects both the vault and its objects (secrets, keys, certificates). After deletion, the vault enters a "soft deleted" state and is held for the retention period (7-90 days, configurable). Recovery uses "az keyvault recover" or portal → Key Vaults → Manage deleted vaults. Purge protection can be additionally enabled to prevent purging during retention, even by administrators.'
},
{
  id:'DFC-6', domain:'DFC', difficulty:'rookie', type:'ms',
  question:'Which capabilities does Microsoft Defender for Cloud provide at no additional cost (free/foundational tier)? (Select all that apply)',
  options:[
    'Continuous assessment of Azure resource configurations',
    'Secure Score calculation',
    'Real-time threat detection alerts for Azure VMs',
    'Security recommendations with remediation steps',
    'Regulatory compliance dashboard against CIS benchmark'
  ],
  answers:[0,1,3],
  explanation:'The foundational (free) Defender for Cloud tier provides: continuous configuration assessment, Secure Score, and security recommendations. Threat detection alerts (real-time) require enabling the paid Defender plans (CWPP). The regulatory compliance dashboard shows a limited set of controls for free, but specific benchmark assessments may require Enhanced workload protections.'
},
{
  id:'DFC-7', domain:'DFC', difficulty:'veteran', type:'ms',
  question:'Azure Key Vault access can be controlled by access policies or RBAC. Which statements about the RBAC model are correct? (Select all that apply)',
  options:[
    'RBAC roles can be scoped to individual secrets, keys, or certificates within the vault',
    'The RBAC model uses standard Azure role assignments visible in the Access control (IAM) blade',
    'Access policies and RBAC authorization models can be used simultaneously on the same vault',
    'Key Vault built-in roles include Key Vault Secrets User, Crypto Officer, and Certificate Officer',
    'RBAC requires Azure AD Premium P2 licensing for Key Vault'
  ],
  answers:[0,1,3],
  explanation:'Key Vault RBAC supports fine-grained roles (Secrets User, Secrets Officer, Crypto User, Crypto Officer, Certificates Officer, etc.) scoped to individual objects within a vault — not possible with access policies. RBAC assignments appear in the standard IAM blade. The two authorization models are mutually exclusive per vault — you set "Azure role-based access control" OR "Vault access policy" as the permission model. No P2 license required.'
},
{
  id:'DFC-8', domain:'DFC', difficulty:'rookie', type:'order',
  question:'Put the steps in the correct order to enable a Defender for Cloud plan for a subscription:',
  items:[
    'Navigate to Microsoft Defender for Cloud in the Azure portal',
    'Select "Environment settings" from the left menu',
    'Click on your subscription to open its settings',
    'Toggle the desired Defender plan (e.g., Defender for Servers) to "On"',
    'Click "Save" to activate the plan'
  ],
  explanation:'Defender plans are enabled per subscription under Environment settings. Each workload type (servers, databases, containers, app service, storage, etc.) is individually toggled. Billing starts per-resource per-hour once enabled. Plans can also be enabled at management group scope to apply across multiple subscriptions automatically.'
},
{
  id:'DFC-9', domain:'DFC', difficulty:'veteran', type:'order',
  question:'Put the steps in the correct order to switch Key Vault authorization from access policies to RBAC:',
  items:[
    'Identify all existing access policy assignments and document them',
    'Create equivalent RBAC role assignments for all current principals at vault scope',
    'Go to the Key Vault → Settings → Access configuration',
    'Change "Permission model" from "Vault access policy" to "Azure role-based access control"',
    'Verify access is working for all applications before removing old documentation'
  ],
  explanation:'The switch from access policies to RBAC is a one-time change that immediately revokes all existing access policies. If you switch without first creating RBAC assignments, all applications will lose access. Document existing policies, pre-create RBAC assignments, then switch the permission model. Test immediately after — the change takes effect within seconds.'
},
{
  id:'DFC-10', domain:'DFC', difficulty:'veteran', type:'match',
  question:'Match each Microsoft Defender for Cloud plan to the workload it protects:',
  pairs:[
    { left:'Defender for Servers',    right:'Windows and Linux virtual machines and Arc-enabled servers' },
    { left:'Defender for Containers', right:'AKS clusters, container registries, and container runtime' },
    { left:'Defender for Storage',    right:'Azure Blob Storage, Azure Files, and Azure Data Lake' },
    { left:'Defender for SQL',        right:'Azure SQL Database, SQL on VMs, and Azure Synapse' }
  ],
  explanation:'Each Defender plan maps to a specific resource type. Defender for Servers covers VMs (including Azure Arc on-premises). Defender for Containers covers the container lifecycle (registry scanning, runtime threat detection in AKS). Defender for Storage detects malicious file uploads and unusual access patterns. Defender for SQL provides vulnerability assessment and advanced threat protection for all SQL variants.'
},
{
  id:'DFC-11', domain:'DFC', difficulty:'elite', type:'match',
  question:'Match each Microsoft Sentinel component to its function:',
  pairs:[
    { left:'Data Connector',    right:'Ingests log data from a source (Azure, third-party, custom)' },
    { left:'Analytics Rule',    right:'Queries logs on a schedule to detect threats and create incidents' },
    { left:'Playbook',          right:'Automated response workflow (Logic App) triggered by an alert or incident' },
    { left:'Hunting Query',     right:'Proactive KQL search for threats not yet triggering alerts' }
  ],
  explanation:'Data Connectors bring data in. Analytics Rules (scheduled, Fusion, NRT) analyze data and create alerts/incidents. Playbooks (Azure Logic Apps) automate response — blocking IPs, sending notifications, creating tickets. Hunting Queries are threat-hunter-authored KQL queries for proactive investigation of potential threats that don\'t yet have detection rules.'
},
{
  id:'DFC-12', domain:'DFC', difficulty:'rookie', type:'yesno',
  stem:'Defender for Cloud — True or False?',
  question:'Review these statements about Microsoft Defender for Cloud:',
  statements:[
    { text:'Defender for Cloud can protect workloads in AWS and GCP in addition to Azure', answer:true },
    { text:'Enabling Defender for Cloud automatically remediates all security recommendations', answer:false },
    { text:'Secure Score decreases when new resources are deployed that do not comply with recommendations', answer:true }
  ],
  explanation:'Defender for Cloud is multi-cloud — AWS and GCP connectors bring non-Azure workloads into the same posture management view. It generates recommendations but does NOT auto-remediate (that requires DeployIfNotExists policies or Playbooks). Secure Score is recalculated as new resources are evaluated — deploying non-compliant resources lowers the score by increasing the denominator of unhealthy controls.'
},
{
  id:'DFC-13', domain:'DFC', difficulty:'rookie', type:'yesno',
  stem:'Azure Key Vault Security — True or False?',
  question:'Review these statements about Key Vault protection features:',
  statements:[
    { text:'Key Vault Purge Protection prevents administrators from permanently deleting a vault during the soft-delete retention period', answer:true },
    { text:'Key Vault diagnostic logs should be sent to a storage account or Log Analytics workspace separate from the vault\'s subscription for security', answer:true },
    { text:'Key Vault access policies are the recommended authorization model for new deployments', answer:false }
  ],
  explanation:'Purge protection locks the vault for the entire retention period — even the vault owner cannot purge it. This prevents ransomware/insider threat from permanently destroying keys. Logging to a separate subscription prevents an attacker who compromised the vault subscription from deleting the audit trail. Microsoft recommends RBAC authorization model for new vaults — it provides more granular, auditable, and standard access control than access policies.'
},
{
  id:'DFC-14', domain:'DFC', difficulty:'veteran', type:'blank',
  question:'Complete these Microsoft Sentinel architecture facts:',
  template:'Sentinel stores all ingested data in a ___[0]___ workspace. Threat detection rules produce ___[1]___ which Sentinel groups into ___[2]___ for investigation.',
  blanks:[
    { options:['Log Analytics','Azure Data Explorer','Cosmos DB','Azure SQL'], answer:0 },
    { options:['Alerts','Incidents','Workbooks','Playbooks'], answer:0 },
    { options:['Incidents','Alerts','Reports','Tickets'], answer:0 }
  ],
  explanation:'Sentinel is built on Log Analytics (Azure Monitor Logs). All ingested data lives in tables in the workspace (e.g., SecurityEvent, SigninLogs, CommonSecurityLog). Analytics rules fire and create Alerts. Related alerts are automatically grouped into Incidents — which are the unit of investigation for SOC analysts. Playbooks can be attached to incidents for automated response.'
},
{
  id:'DFC-15', domain:'DFC', difficulty:'elite', type:'blank',
  question:'Complete these Key Vault access facts:',
  template:'When Key Vault uses the RBAC authorization model, a secret read operation requires the ___[0]___ role at minimum. To allow a principal to create and delete secrets, assign the ___[1]___ role. For operations on cryptographic keys (sign/verify/encrypt), use the ___[2]___ role.',
  blanks:[
    { options:['Key Vault Secrets User','Key Vault Reader','Key Vault Administrator','Key Vault Secrets Officer'], answer:0 },
    { options:['Key Vault Secrets Officer','Key Vault Secrets User','Key Vault Reader','Contributor'], answer:0 },
    { options:['Key Vault Crypto User','Key Vault Crypto Officer','Key Vault Administrator','Key Vault Reader'], answer:0 }
  ],
  explanation:'RBAC roles map to specific operations: Secrets User = get+list (read-only). Secrets Officer = create+delete+update+get+list. Crypto User = sign/verify/encrypt/decrypt (no key creation). Crypto Officer = create/import/delete keys + crypto operations. Certificates Officer = manage certificates. Administrator = full access. Always assign the minimum role needed — never use Administrator for application access.'
},

// ══════════════════════ STR — 15 QUESTIONS ══════════════════════

{
  id:'STR-1', domain:'STR', difficulty:'rookie', type:'mc',
  question:'A developer accidentally committed a storage account SAS token to a public GitHub repo. What is the fastest mitigation?',
  options:[
    'Delete the storage account and recreate it',
    'Enable soft delete on the account',
    'Enable firewall rules on the storage account',
    'Rotate the storage account access key that was used to sign the SAS token'
  ],
  answer:3,
  explanation:'SAS tokens are signed with a storage account key or user delegation key. Rotating the signing key immediately invalidates ALL SAS tokens signed with that key — without needing to track individual tokens. This is the fastest remediation. After rotation, generate new SAS tokens with appropriate scope and expiry. Longer-term, use Microsoft Entra-based authentication instead of key-based SAS.'
},
{
  id:'STR-2', domain:'STR', difficulty:'rookie', type:'mc',
  question:'You need blobs in a container to remain unmodified and undeletable for 7 years for regulatory compliance. Which feature should you use?',
  options:[
    'Blob soft delete with a 7-year retention period',
    'Immutability policy (WORM) with time-based retention',
    'Azure Backup with 7-year retention policy',
    'Geo-redundant storage (GRS) replication'
  ],
  answer:1,
  explanation:'Immutability policies (WORM — Write Once Read Many) prevent any modification or deletion of blobs for the retention period, even by subscription owners or Microsoft. Time-based retention policies lock for a specific duration. Legal hold policies lock indefinitely until removed. Soft delete recovers accidental deletions but doesn\'t prevent deliberate deletion by authorized users. GRS is for disaster recovery, not compliance retention.'
},
{
  id:'STR-3', domain:'STR', difficulty:'veteran', type:'mc',
  question:'Transparent Data Encryption (TDE) is enabled on an Azure SQL database. What does TDE protect against?',
  options:[
    'SQL injection attacks against the database',
    'Unauthorized access to database files and backups on disk',
    'Privileged users (DBAs) reading sensitive column data',
    'Data exfiltration through SQL queries by legitimate users'
  ],
  answer:1,
  explanation:'TDE encrypts the database data files, log files, and backups at rest using AES-256. It protects against physical theft of storage media or unauthorized access to underlying data files. It does NOT protect against legitimate users (including DBAs) querying data — TDE is transparent to authorized connections. For column-level protection from DBAs, use Always Encrypted.'
},
{
  id:'STR-4', domain:'STR', difficulty:'veteran', type:'mc',
  question:'Always Encrypted is configured for the SSN column in Azure SQL. A DBA connects and runs SELECT SSN FROM Customers. What does the DBA see?',
  options:[
    'The plaintext SSN values',
    'NULL for all SSN values',
    'Encrypted ciphertext — the DBA cannot read the plaintext',
    'A permission denied error'
  ],
  answer:2,
  explanation:'Always Encrypted uses client-side encryption — encryption/decryption happens in the application driver, not the database engine. The database only ever sees ciphertext for encrypted columns. Even DBAs, Azure support staff, and anyone with full SQL access sees only ciphertext unless they have access to the Column Master Key (CMK) stored outside the database (e.g., Azure Key Vault or a hardware HSM).'
},
{
  id:'STR-5', domain:'STR', difficulty:'elite', type:'mc',
  question:'A storage account has both a firewall rule allowing specific VNet subnets AND a private endpoint. Public network access is set to "Enabled from selected virtual networks and IP addresses." An app in the specified VNet is getting 403 Forbidden errors. What is the most likely cause?',
  options:[
    'The private endpoint and firewall rules conflict and must not be used together',
    'The subnet\'s service endpoint for Microsoft.Storage is not enabled, so the VNet rule is not effective',
    'The storage firewall denies all traffic by default even from listed VNets',
    'The app must use the private endpoint FQDN, not the public FQDN'
  ],
  answer:1,
  explanation:'Storage account VNet firewall rules (the "selected virtual networks" option) require the subnet to have the Microsoft.Storage service endpoint enabled. Without the service endpoint, traffic from the VNet still appears to come from the VNet\'s public NAT IP — not from the VNet identity — and the storage firewall doesn\'t recognize it as VNet traffic. Solution: enable the Microsoft.Storage service endpoint on the subnet, or switch to Private Endpoint which doesn\'t require service endpoints.'
},
{
  id:'STR-6', domain:'STR', difficulty:'rookie', type:'ms',
  question:'Which features protect data in Azure Storage from accidental deletion? (Select all that apply)',
  options:[
    'Blob soft delete',
    'Container soft delete',
    'Storage account soft delete (via Azure Backup)',
    'Immutability policies (WORM)',
    'Geo-redundant storage (GRS)'
  ],
  answers:[0,1,2,3],
  explanation:'Blob soft delete retains deleted blobs for 1-365 days. Container soft delete retains deleted containers. Storage account protection (via Azure Backup vault soft delete) recovers deleted storage accounts. Immutability policies prevent deletion during the retention period. GRS provides geo-replication for disaster recovery but does NOT protect against accidental deletion — deletes replicate to the secondary region.'
},
{
  id:'STR-7', domain:'STR', difficulty:'veteran', type:'ms',
  question:'Which Azure SQL security features help protect sensitive data from unauthorized access? (Select all that apply)',
  options:[
    'Always Encrypted — column-level client-side encryption',
    'Dynamic Data Masking — obfuscates data in query results for non-privileged users',
    'Transparent Data Encryption (TDE) — encrypts data files at rest',
    'Row-Level Security — restricts which rows a user can query',
    'Azure Defender for SQL — detects SQL injection and anomalous access'
  ],
  answers:[0,1,2,3,4],
  explanation:'All five are SQL data protection features: Always Encrypted hides data from DBAs; Dynamic Data Masking obfuscates sensitive columns for specific users in query results without changing stored data; TDE protects at-rest disk files; Row-Level Security restricts row access based on user context; Defender for SQL detects injection attempts, privilege escalation, and unusual query patterns. A complete defense-in-depth strategy uses all of them.'
},
{
  id:'STR-8', domain:'STR', difficulty:'rookie', type:'order',
  question:'Put the steps in the correct order to generate a Service SAS token for a specific blob container:',
  items:[
    'Navigate to the storage account in the Azure portal',
    'Open the container and click "Generate SAS"',
    'Set permissions (Read, Write, Delete, List) to the minimum required',
    'Set the expiry date to the minimum required duration',
    'Click "Generate SAS token and URL" and copy the SAS URL'
  ],
  explanation:'SAS token creation: storage account → container → Generate SAS → set minimum permissions and expiry → generate. Always apply least privilege (don\'t grant Write/Delete if only Read is needed) and short expiry. For production, prefer stored access policies (linked to the container) over ad-hoc SAS tokens — policies can be revoked without rotating the account key.'
},
{
  id:'STR-9', domain:'STR', difficulty:'veteran', type:'order',
  question:'Put the steps in the correct order to enable SQL Auditing for an Azure SQL database and send logs to Log Analytics:',
  items:[
    'Navigate to the Azure SQL server (server-level) or database in the portal',
    'Under Security, select "Auditing" and toggle to "On"',
    'Select "Log Analytics" as the audit log destination',
    'Choose or create a Log Analytics workspace',
    'Click Save — audit events begin streaming to the workspace'
  ],
  explanation:'SQL Auditing can be configured at server level (applies to all databases) or database level. Server-level audit overrides database-level settings. Audit destinations: Storage account (cheapest, good for archival), Log Analytics (enables KQL queries and Sentinel integration), Event Hub (for real-time streaming to SIEM). Auditing captures login events, schema changes, data access, and more.'
},
{
  id:'STR-10', domain:'STR', difficulty:'veteran', type:'match',
  question:'Match each Azure Storage security feature to its primary protection:',
  pairs:[
    { left:'Storage Service Encryption (SSE)', right:'Automatic encryption of all data at rest in Azure Storage' },
    { left:'SAS token with stored access policy', right:'Revocable time-bound access without exposing account keys' },
    { left:'Immutability policy (WORM)',          right:'Prevents modification or deletion of blobs during retention period' },
    { left:'Azure AD authorization for Storage',  right:'Identity-based access using RBAC instead of shared keys' }
  ],
  explanation:'SSE (Microsoft managed keys by default) encrypts all storage data at rest — always on. SAS tokens with stored access policies allow access revocation by modifying the policy without rotating the account key. Immutability (WORM) satisfies SEC 17a-4, CFTC, and FINRA compliance requirements. Azure AD RBAC authorization is preferred over shared key — it provides identity attribution and supports Conditional Access.'
},
{
  id:'STR-11', domain:'STR', difficulty:'elite', type:'match',
  question:'Match each Azure SQL security feature to its protection type:',
  pairs:[
    { left:'Always Encrypted',     right:'Protects data in use — even the database engine cannot see plaintext' },
    { left:'TDE with CMK',         right:'Customer controls the at-rest encryption key in Azure Key Vault' },
    { left:'Ledger tables',        right:'Cryptographically tamper-evident record of all data modifications' },
    { left:'Microsoft Purview',    right:'Data discovery, classification, and sensitivity labeling across SQL' }
  ],
  explanation:'Always Encrypted keeps data encrypted in the database engine itself. TDE with Customer Managed Keys (CMK) = BYOK (Bring Your Own Key) — you control key rotation and revocation, and revoking the CMK makes the database unreadable. Ledger tables create a blockchain-like audit trail of row modifications using SQL hashing. Microsoft Purview discovers and classifies sensitive data across Azure SQL and other sources.'
},
{
  id:'STR-12', domain:'STR', difficulty:'rookie', type:'yesno',
  stem:'SAS Token Security — True or False?',
  question:'Review these statements about Shared Access Signatures:',
  statements:[
    { text:'A User Delegation SAS is signed using Azure AD credentials and does not use storage account keys', answer:true },
    { text:'SAS tokens embedded in application code are a security best practice', answer:false },
    { text:'A stored access policy allows you to revoke a SAS token before it expires', answer:true }
  ],
  explanation:'User Delegation SAS uses OAuth2 Azure AD credentials — these expire with the user\'s token and are more secure than key-based SAS. Embedding SAS tokens in code is a security anti-pattern — they should be generated dynamically, stored in Key Vault, or replaced with managed identity authentication. Stored access policies allow revocation by modifying or deleting the policy, immediately invalidating linked tokens.'
},
{
  id:'STR-13', domain:'STR', difficulty:'rookie', type:'yesno',
  stem:'Azure SQL Security — True or False?',
  question:'Review these statements about Azure SQL database security:',
  statements:[
    { text:'Azure SQL firewall rules at the server level apply to all databases on that server', answer:true },
    { text:'Enabling Microsoft Defender for SQL on a database enables TDE automatically', answer:false },
    { text:'Azure SQL Advanced Threat Protection can detect potential SQL injection attacks', answer:true }
  ],
  explanation:'Server-level firewall rules apply to all databases under that logical server (efficient for bulk access control). Defender for SQL and TDE are independent features — Defender is threat detection, TDE is encryption at rest; enabling one does not enable the other. Advanced Threat Protection (part of Defender for SQL) analyzes query patterns and detects anomalies including SQL injection, brute force, and unusual access locations.'
},
{
  id:'STR-14', domain:'STR', difficulty:'veteran', type:'blank',
  question:'Complete these Azure Storage access control facts:',
  template:'Shared Key authorization uses the storage account ___[0]___ and grants full access to all storage services. To provide time-limited access to a specific blob, generate a ___[1]___ token. The recommended approach for Azure services is ___[2]___ instead of shared keys.',
  blanks:[
    { options:['access key (512-bit)','SAS token','connection string','client certificate'], answer:0 },
    { options:['SAS (Shared Access Signature)','OAuth token','managed identity credential','API key'], answer:0 },
    { options:['managed identity with RBAC','service principal with secret','access key rotation','SAS with IP restriction'], answer:0 }
  ],
  explanation:'Shared Key (account key) provides unrestricted access to all storage services — treat it like a root password. SAS tokens are scoped, time-limited, and permission-limited credentials derived from the account key or Azure AD. Managed identity with RBAC is the recommended approach for Azure services: no credentials to store, rotate, or accidentally expose, and it supports Conditional Access policies.'
},
{
  id:'STR-15', domain:'STR', difficulty:'elite', type:'blank',
  question:'Complete these facts about SQL data protection:',
  template:'Always Encrypted stores the Column Encryption Key (CEK) encrypted by a ___[0]___ which should be stored in ___[1]___. Dynamic Data Masking does NOT prevent ___[2]___ users from seeing unmasked data.',
  blanks:[
    { options:['Column Master Key (CMK)','Transparent Data Encryption key','Database Encryption Key','Server certificate'], answer:0 },
    { options:['Azure Key Vault or a hardware security module (HSM)','the database itself','Azure Blob Storage','Azure AD'], answer:0 },
    { options:['privileged / db_owner','read-only','guest','service account'], answer:0 }
  ],
  explanation:'Always Encrypted key hierarchy: Column Encryption Key (CEK) encrypts data columns → Column Master Key (CMK) encrypts the CEK → CMK stored in Azure Key Vault or HSM (never in the database). Dynamic Data Masking masks data in query results for non-privileged users, but db_owner, sysadmin, and users with UNMASK privilege always see the real data — it\'s obfuscation, not encryption.'
}

]; // END QUESTION_BANK
