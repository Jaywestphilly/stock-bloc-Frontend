import React, { useState, useMemo } from "react";
import {
  Zap,
  Cpu,
  Server,
  Network,
  Flame,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Globe,
  Database,
  Grid,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BarChart2,
  Activity,
  Boxes,
  Radio,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { triggerHaptic } from "../../utils/haptics";

export interface CompanyEntry {
  company: string;
  ticker: string;
  exchange: string;
  category: string;
  subCategory: string;
  whatTheyDo: string;
  isPrivate?: boolean;
  isUnverified?: boolean;
  notes?: string;
}

export const VALUE_CHAIN_DATA: CompanyEntry[] = [
  // Owners / Operators - Hyperscalers
  { company: "Meta Platforms", ticker: "META", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Social media/advertising giant; builds massive in-house AI data center capacity for Llama and its AI products." },
  { company: "Alphabet (Google)", ticker: "GOOGL", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Search/advertising and Google Cloud; designs its own TPU AI chips and runs some of the largest AI campuses globally." },
  { company: "Amazon", ticker: "AMZN", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Owns AWS, the largest cloud platform; largest single spender on AI data center capex, designs Trainium/Inferentia chips." },
  { company: "Microsoft", ticker: "MSFT", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Azure cloud provider and OpenAI's primary infrastructure partner; among the largest AI data center builders." },
  { company: "Alibaba Group", ticker: "BABA", exchange: "NYSE", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "China's largest e-commerce company; Alibaba Cloud is China's leading hyperscale cloud provider." },
  { company: "Tencent", ticker: "0700", exchange: "HKEX", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Chinese internet/gaming conglomerate; Tencent Cloud is a major domestic hyperscaler." },
  { company: "SpaceX", ticker: "Private", exchange: "Private", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Rocket launch and Starlink satellite operator; increasingly tied to power-hungry compute buildouts.", isPrivate: true },
  { company: "Oracle", ticker: "ORCL", exchange: "NYSE", category: "Owners / Operators", subCategory: "Hyperscalers", whatTheyDo: "Enterprise database/software company; Oracle Cloud Infrastructure (OCI) has become a major AI training capacity provider (OpenAI deals)." },

  // DC REITs / Operators
  { company: "GDS Holdings", ticker: "GDS", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "China-based data center developer and operator." },
  { company: "Digital Realty Trust", ticker: "DLR", exchange: "NYSE", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "One of the world's largest data center REITs." },
  { company: "NextDC", ticker: "NXT", exchange: "ASX", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Australian data center operator." },
  { company: "SUNeVision", ticker: "1686", exchange: "HKEX", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Hong Kong data center operator (Sun Hung Kai Properties affiliate)." },
  { company: "VNET Group", ticker: "VNET", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Chinese carrier-neutral data center operator." },
  { company: "Equinix", ticker: "EQIX", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Global interconnection and colocation data center REIT." },
  { company: "Goodman Group", ticker: "GMG", exchange: "ASX", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Australian industrial/logistics REIT expanding into data center development." },
  { company: "Keppel DC REIT", ticker: "AJBU", exchange: "SGX", category: "Owners / Operators", subCategory: "DC REITs / Operators", whatTheyDo: "Singapore-listed data center-focused REIT." },

  // Private Equity / Asset Managers
  { company: "Antin Infrastructure Partners", ticker: "ANTIN", exchange: "Euronext Paris", category: "Owners / Operators", subCategory: "Private Equity / Asset Managers", whatTheyDo: "European infrastructure private equity fund, active in digital infrastructure." },
  { company: "Brookfield Asset Mgmt", ticker: "BAM", exchange: "NYSE", category: "Owners / Operators", subCategory: "Private Equity / Asset Managers", whatTheyDo: "Global alternative asset manager; one of the largest investors in data centers and power generation." },
  { company: "Blackstone", ticker: "BX", exchange: "NYSE", category: "Owners / Operators", subCategory: "Private Equity / Asset Managers", whatTheyDo: "World's largest alternative asset manager; owns QTS Data Centers and is a major data center real estate investor." },
  { company: "Macquarie Group", ticker: "MQG", exchange: "ASX", category: "Owners / Operators", subCategory: "Private Equity / Asset Managers", whatTheyDo: "Australian financial services group with a large infrastructure and asset management arm." },

  // Enterprises / Tier 2 Clouds
  { company: "IBM", ticker: "IBM", exchange: "NYSE", category: "Owners / Operators", subCategory: "Tier 2 Clouds", whatTheyDo: "Enterprise IT/hybrid cloud provider; watsonx AI platform." },
  { company: "SAP", ticker: "SAP", exchange: "NYSE", category: "Owners / Operators", subCategory: "Tier 2 Clouds", whatTheyDo: "German enterprise resource planning (ERP) software leader, expanding AI-enabled cloud offerings." },
  { company: "Salesforce", ticker: "CRM", exchange: "NYSE", category: "Owners / Operators", subCategory: "Tier 2 Clouds", whatTheyDo: "CRM/enterprise cloud software leader; Agentforce AI platform." },
  { company: "OVHcloud", ticker: "OVH", exchange: "Euronext Paris", category: "Owners / Operators", subCategory: "Tier 2 Clouds", whatTheyDo: "European independent cloud infrastructure provider." },
  { company: "DigitalOcean", ticker: "DOCN", exchange: "NYSE", category: "Owners / Operators", subCategory: "Tier 2 Clouds", whatTheyDo: "Cloud computing platform for developers and SMBs." },

  // Neo-cloud
  { company: "CoreWeave", ticker: "CRWV", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Neo-cloud", whatTheyDo: "GPU-specialized ('neo-cloud') infrastructure provider built around Nvidia hardware." },
  { company: "Nebius Group", ticker: "NBIS", exchange: "NASDAQ", category: "Owners / Operators", subCategory: "Neo-cloud", whatTheyDo: "AI infrastructure/GPU cloud provider (spun out of Yandex)." },

  // Semi Production - IC Design
  { company: "Nvidia", ticker: "NVDA", exchange: "NASDAQ", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Dominant designer of AI training/inference GPUs and accelerators." },
  { company: "AMD", ticker: "AMD", exchange: "NASDAQ", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Designs CPUs and GPUs; primary competitor to Nvidia in AI accelerators." },
  { company: "Broadcom", ticker: "AVGO", exchange: "NASDAQ", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Designs custom AI ASICs (for Google, Meta, etc.) and networking silicon." },
  { company: "Qualcomm", ticker: "QCOM", exchange: "NASDAQ", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Mobile and edge-AI chip designer, expanding into AI inference accelerators." },
  { company: "Marvell Technology", ticker: "MRVL", exchange: "NASDAQ", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Designs custom silicon (ASICs), optical, and data-center interconnect chips." },
  { company: "Hewlett Packard Enterprise", ticker: "HPE", exchange: "NYSE", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Enterprise compute/networking vendor with custom silicon and systems design work." },
  { company: "Montage Technology", ticker: "688008", exchange: "STAR", category: "Semi Production", subCategory: "IC Design", whatTheyDo: "Chinese designer of memory-interface and connectivity chips." },

  // OSAT
  { company: "ASE Technology Holding", ticker: "ASX", exchange: "NYSE", category: "Semi Production", subCategory: "OSAT", whatTheyDo: "World's largest outsourced chip assembly, packaging, and test (OSAT) provider." },
  { company: "KYEC (King Yuan Electronics)", ticker: "2449", exchange: "TWSE", category: "Semi Production", subCategory: "OSAT", whatTheyDo: "Taiwan-based semiconductor testing house." },
  { company: "Tong Hsing Electronic", ticker: "6217", exchange: "TWSE", category: "Semi Production", subCategory: "OSAT", whatTheyDo: "Taiwan-based semiconductor packaging and substrate maker." },

  // Foundry
  { company: "TSMC", ticker: "TSM", exchange: "NYSE", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "World's largest dedicated chip foundry; manufactures nearly all leading-edge AI chips." },
  { company: "UMC (United Microelectronics)", ticker: "UMC", exchange: "NYSE", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "Taiwan-based semiconductor foundry." },
  { company: "Samsung Electronics", ticker: "005930", exchange: "KRX", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "Diversified electronics giant with major foundry and memory chip businesses." },
  { company: "VIS (Vanguard Intl)", ticker: "5347", exchange: "TPEx", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "Taiwan-based specialty/mature-node foundry." },
  { company: "GlobalFoundries", ticker: "GFS", exchange: "NASDAQ", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "US-based specialty semiconductor foundry." },
  { company: "SMIC", ticker: "0981", exchange: "HKEX", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "China's largest and most advanced domestic chip foundry." },
  { company: "Win Semiconductors", ticker: "3105", exchange: "TPEx", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "Taiwan-based compound semiconductor (GaAs/GaN) foundry." },
  { company: "PSMC", ticker: "6770", exchange: "TWSE", category: "Semi Production", subCategory: "Foundry", whatTheyDo: "Taiwan-based memory and foundry manufacturer." },

  // IDM (Semi w/ Fabs)
  { company: "Intel", ticker: "INTC", exchange: "NASDAQ", category: "Semi Production", subCategory: "IDM (Semi w/ Fabs)", whatTheyDo: "Integrated device manufacturer designing and fabricating its own CPUs; also runs Intel Foundry." },
  { company: "Infineon Technologies", ticker: "IFX", exchange: "XETRA", category: "Semi Production", subCategory: "IDM (Semi w/ Fabs)", whatTheyDo: "German integrated device manufacturer specializing in power and automotive semiconductors." },
  { company: "SK hynix", ticker: "000660", exchange: "KRX", category: "Semi Production", subCategory: "IDM (Semi w/ Fabs)", whatTheyDo: "Leading memory chipmaker; dominant supplier of HBM used in AI accelerators." },
  { company: "STMicroelectronics", ticker: "STM", exchange: "NYSE", category: "Semi Production", subCategory: "IDM (Semi w/ Fabs)", whatTheyDo: "European IDM producing power, analog, and microcontroller chips." },
  { company: "Renesas Electronics", ticker: "6723", exchange: "TSE", category: "Semi Production", subCategory: "IDM (Semi w/ Fabs)", whatTheyDo: "Japanese IDM specializing in automotive and industrial microcontrollers." },

  // Semi Design Services
  { company: "GUC (Global Unichip)", ticker: "3443", exchange: "TWSE", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "TSMC-affiliated ASIC design service provider." },
  { company: "Andes Technology", ticker: "6533", exchange: "TPEx", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Taiwan-based RISC-V processor IP and design-service provider." },
  { company: "Empyrean Technology", ticker: "301269", exchange: "Shenzhen", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Chinese electronic design automation (EDA) software company." },
  { company: "Arm Holdings", ticker: "ARM", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Licenses chip architecture/IP used across most mobile and increasingly AI/server chips." },
  { company: "Cadence Design Systems", ticker: "CDNS", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Electronic design automation (EDA) software for chip design." },
  { company: "Synopsys", ticker: "SNPS", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Electronic design automation (EDA) software for chip design." },
  { company: "Alchip Technologies", ticker: "3661", exchange: "TWSE", category: "Semi Production", subCategory: "Semi Design Services", whatTheyDo: "Taiwan-based ASIC design service and chip-design house." },

  // Semi Capital Equipment
  { company: "ASML", ticker: "ASML", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Sole supplier of extreme ultraviolet (EUV) lithography systems needed for leading-edge chips." },
  { company: "Tokyo Electron (TEL)", ticker: "8035", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Major supplier of wafer fabrication equipment (deposition, etch, coat/develop)." },
  { company: "SCREEN Holdings", ticker: "7735", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Japanese maker of wafer cleaning and coating equipment." },
  { company: "Kokusai Electric", ticker: "6525", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Semiconductor deposition (batch furnace) equipment maker." },
  { company: "Advantest", ticker: "6857", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Leading maker of automated semiconductor test equipment." },
  { company: "Nikon", ticker: "7731", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Precision optics maker, including lithography systems." },
  { company: "Disco Corporation", ticker: "6146", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of wafer dicing and grinding equipment." },
  { company: "Lasertec", ticker: "6920", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of photomask and EUV inspection equipment." },
  { company: "Ulvac", ticker: "6728", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Vacuum and thin-film deposition equipment maker." },
  { company: "JEOL", ticker: "6951", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of electron microscopes and metrology equipment." },
  { company: "Ushio", ticker: "6925", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of lithography light sources and specialty lamps." },
  { company: "ACM Research", ticker: "ACMR", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of wafer cleaning and advanced packaging equipment." },
  { company: "Micronics Japan (MJC)", ticker: "6871", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of semiconductor test/probe card equipment." },
  { company: "Gudeng Precision", ticker: "3680", exchange: "TWSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of EUV pods and photomask-handling equipment." },
  { company: "Accretech (Tokyo Seimitsu)", ticker: "7729", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of metrology and dicing equipment." },
  { company: "TOWA Corporation", ticker: "6315", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of semiconductor molding/packaging equipment." },
  { company: "Applied Materials", ticker: "AMAT", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "World's largest supplier of semiconductor wafer fabrication equipment." },
  { company: "ASMPT", ticker: "0522", exchange: "HKEX", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of semiconductor assembly and packaging equipment." },
  { company: "BE Semiconductor (Besi)", ticker: "BESI", exchange: "Euronext Amsterdam", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of semiconductor assembly (die/flip-chip bonding) equipment." },
  { company: "Hoya Corporation", ticker: "7741", exchange: "TSE", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Maker of photomask blanks and optical/precision components." },
  { company: "KLA Corporation", ticker: "KLAC", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Leading maker of process control and yield-management (inspection) equipment." },
  { company: "Lam Research", ticker: "LRCX", exchange: "NASDAQ", category: "Semi Production", subCategory: "Semi Capital Equipment", whatTheyDo: "Major supplier of etch and deposition wafer fab equipment." },

  // Server Components - Power Supply & Passives
  { company: "Delta Electronics", ticker: "2308", exchange: "TWSE", category: "Server Components", subCategory: "Power Supply", whatTheyDo: "Major maker of power supplies and thermal/cooling systems for servers." },
  { company: "Lite-On Technology", ticker: "2301", exchange: "TWSE", category: "Server Components", subCategory: "Power Supply", whatTheyDo: "Maker of power supplies and electronic components." },
  { company: "Yageo Corporation", ticker: "2327", exchange: "TWSE", category: "Server Components", subCategory: "Passive Component", whatTheyDo: "Major maker of passive components (resistors, capacitors)." },
  { company: "Samsung Electro-Mechanics", ticker: "009150", exchange: "KRX", category: "Server Components", subCategory: "Passive Component", whatTheyDo: "Maker of passive components, MLCCs, and IC substrates." },
  { company: "Murata Manufacturing", ticker: "6981", exchange: "TSE", category: "Server Components", subCategory: "Passive Component", whatTheyDo: "Leading maker of capacitors and other passive electronic components." },
  { company: "AVC (Asia Vital Components)", ticker: "3017", exchange: "TWSE", category: "Server Components", subCategory: "Thermal Solution", whatTheyDo: "Maker of thermal/cooling modules and liquid cooling for servers." },
  { company: "Auras Technology", ticker: "3324", exchange: "TPEx", category: "Server Components", subCategory: "Thermal Solution", whatTheyDo: "Maker of thermal modules and liquid cooling solutions." },
  { company: "Unimicron Technology", ticker: "3037", exchange: "TWSE", category: "Server Components", subCategory: "PCB / IC Substrates", whatTheyDo: "Major maker of PCBs and IC substrates." },
  { company: "Ibiden", ticker: "4062", exchange: "TSE", category: "Server Components", subCategory: "PCB / IC Substrates", whatTheyDo: "Maker of IC substrates used in advanced packaging." },
  { company: "Gold Circuit Electronics (GCE)", ticker: "2368", exchange: "TWSE", category: "Server Components", subCategory: "PCB / IC Substrates", whatTheyDo: "Maker of printed circuit boards (PCBs)." },

  // Server
  { company: "Dell Technologies", ticker: "DELL", exchange: "NYSE", category: "Server", subCategory: "Server Brands", whatTheyDo: "Major server and enterprise hardware OEM." },
  { company: "Inspur", ticker: "000977", exchange: "Shenzhen", category: "Server", subCategory: "Server Brands", whatTheyDo: "Chinese server manufacturer, major domestic AI server supplier." },
  { company: "Gigabyte Technology", ticker: "2376", exchange: "TWSE", category: "Server", subCategory: "Server Brands", whatTheyDo: "Maker of servers, motherboards, and ODM assembly." },
  { company: "Foxconn (Hon Hai Precision)", ticker: "2317", exchange: "TWSE", category: "Server", subCategory: "ODM / EMS", whatTheyDo: "World's largest contract electronics manufacturer, major AI server assembler." },
  { company: "Wistron Corporation", ticker: "3231", exchange: "TWSE", category: "Server", subCategory: "ODM / EMS", whatTheyDo: "Original design manufacturer (ODM) of electronics, including AI servers." },
  { company: "Wiwynn Corporation", ticker: "6669", exchange: "TWSE", category: "Server", subCategory: "ODM / EMS", whatTheyDo: "Server ODM spun off from Wistron; major AI server assembler." },
  { company: "Quanta Computer", ticker: "2382", exchange: "TWSE", category: "Server", subCategory: "ODM / EMS", whatTheyDo: "Major server and laptop ODM." },
  { company: "Micron Technology", ticker: "MU", exchange: "NASDAQ", category: "Server", subCategory: "Memory / Storage", whatTheyDo: "US memory and storage chipmaker (DRAM, NAND, HBM)." },
  { company: "Western Digital", ticker: "WDC", exchange: "NASDAQ", category: "Server", subCategory: "Memory / Storage", whatTheyDo: "Maker of hard disk drives (HDDs) and storage solutions." },
  { company: "Pure Storage", ticker: "PSTG", exchange: "NYSE", category: "Server", subCategory: "Memory / Storage", whatTheyDo: "Maker of all-flash enterprise storage systems." },

  // Network & Cabling
  { company: "Arista Networks", ticker: "ANET", exchange: "NYSE", category: "Network", subCategory: "Ethernet", whatTheyDo: "Leading maker of high-performance Ethernet switches for data centers/AI clusters." },
  { company: "Cisco Systems", ticker: "CSCO", exchange: "NASDAQ", category: "Network", subCategory: "DCI & Routing", whatTheyDo: "Major router, networking hardware, and optical data-center-interconnect (DCI) vendor." },
  { company: "Ciena Corporation", ticker: "CIEN", exchange: "NYSE", category: "Network", subCategory: "DCI & Routing", whatTheyDo: "Leading maker of optical networking and DCI equipment." },
  { company: "Coherent Corp", ticker: "COHR", exchange: "NYSE", category: "Network", subCategory: "Cabling & Optics", whatTheyDo: "Maker of optical components and transceivers." },
  { company: "Lumentum Holdings", ticker: "LITE", exchange: "NASDAQ", category: "Network", subCategory: "Cabling & Optics", whatTheyDo: "Maker of optical components for data center networking." },

  // Internal Power / Cooling
  { company: "Vertiv Holdings", ticker: "VRT", exchange: "NYSE", category: "Internal Power / Cooling", subCategory: "Liquid Cooling & UPS", whatTheyDo: "Leading supplier of data center power, liquid cooling infrastructure, and UPS systems." },
  { company: "Carrier Global", ticker: "CARR", exchange: "NYSE", category: "Internal Power / Cooling", subCategory: "Liquid Cooling", whatTheyDo: "HVAC and cooling systems maker." },
  { company: "Schneider Electric", ticker: "SU", exchange: "Euronext Paris", category: "Internal Power / Cooling", subCategory: "Power Electronics", whatTheyDo: "Power management, UPS, and cooling infrastructure provider." },
  { company: "Eaton Corporation", ticker: "ETN", exchange: "NYSE", category: "Internal Power / Cooling", subCategory: "Power Electronics", whatTheyDo: "Power management technology and UPS provider." },
  { company: "Emerson Electric", ticker: "EMR", exchange: "NYSE", category: "Internal Power / Cooling", subCategory: "Power Electronics", whatTheyDo: "Automation and power management technology provider." },

  // Power Supply & Grid Infrastructure
  { company: "NextEra Energy", ticker: "NEE", exchange: "NYSE", category: "Power & Grid", subCategory: "Grid + Renewables", whatTheyDo: "Largest US renewable energy utility/generator." },
  { company: "AES Corporation", ticker: "AES", exchange: "NYSE", category: "Power & Grid", subCategory: "Grid + Renewables", whatTheyDo: "US power generation company with a large renewables/storage portfolio." },
  { company: "CATL", ticker: "300750", exchange: "Shenzhen", category: "Power & Grid", subCategory: "Grid + Renewables", whatTheyDo: "World's largest EV and grid-scale battery manufacturer." },
  { company: "Caterpillar", ticker: "CAT", exchange: "NYSE", category: "Power & Grid", subCategory: "Generators", whatTheyDo: "Heavy equipment maker, including large backup/prime power generators." },
  { company: "GE Vernova", ticker: "GEV", exchange: "NYSE", category: "Power & Grid", subCategory: "Grid Infrastructure", whatTheyDo: "Maker of power generation, grid, and electrification equipment (GE spin-off)." },
  { company: "Siemens Energy", ticker: "ENR", exchange: "XETRA", category: "Power & Grid", subCategory: "Grid Infrastructure", whatTheyDo: "Maker of grid and power generation equipment (spun off from Siemens)." },

  // Nuclear & Fuel Cells
  { company: "Constellation Energy", ticker: "CEG", exchange: "NASDAQ", category: "Power & Grid", subCategory: "Nuclear Power Plant", whatTheyDo: "Largest US operator of nuclear power plants." },
  { company: "Vistra Corp", ticker: "VST", exchange: "NYSE", category: "Power & Grid", subCategory: "Nuclear Power Plant", whatTheyDo: "Power generator with nuclear assets; supplies power directly to data centers." },
  { company: "Talen Energy", ticker: "TLN", exchange: "NASDAQ", category: "Power & Grid", subCategory: "Nuclear Power Plant", whatTheyDo: "Power generator with nuclear assets (Amazon data center co-location deal)." },
  { company: "Bloom Energy", ticker: "BE", exchange: "NYSE", category: "Power & Grid", subCategory: "Fuel Cells", whatTheyDo: "Maker of solid oxide fuel cell power systems used for on-site data center power." },

  // Bitcoin / HPC Conversion
  { company: "Galaxy Digital Holdings", ticker: "GLXY", exchange: "NASDAQ", category: "Crypto / HPC", subCategory: "Bitcoin/HPC Pivot", whatTheyDo: "Digital asset merchant bank pivoting infrastructure toward AI/HPC data centers." },
  { company: "Cipher Mining", ticker: "CIFR", exchange: "NASDAQ", category: "Crypto / HPC", subCategory: "Bitcoin/HPC Pivot", whatTheyDo: "Bitcoin miner converting facilities to AI/HPC hosting capacity." },
  { company: "TeraWulf", ticker: "WULF", exchange: "NASDAQ", category: "Crypto / HPC", subCategory: "Bitcoin/HPC Pivot", whatTheyDo: "Bitcoin miner pivoting toward AI/HPC data center hosting." },
  { company: "MARA Holdings", ticker: "MARA", exchange: "NASDAQ", category: "Crypto / HPC", subCategory: "Bitcoin/HPC Pivot", whatTheyDo: "Large bitcoin miner exploring diversification into HPC hosting." },
  { company: "Applied Digital", ticker: "APLD", exchange: "NASDAQ", category: "Crypto / HPC", subCategory: "Bitcoin/HPC Pivot", whatTheyDo: "Former crypto miner now focused on AI/HPC data center hosting." },
];

export const AiValueChainHeatmap: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"tree" | "grid" | "table">("tree");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(VALUE_CHAIN_DATA.map((d) => d.category)));
    return ["ALL", ...cats];
  }, []);

  const filteredData = useMemo(() => {
    return VALUE_CHAIN_DATA.filter((item) => {
      const matchesCat =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.company.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q) ||
        item.whatTheyDo.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Chart data for category counts
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    VALUE_CHAIN_DATA.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const COLORS = [
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  return (
    <div className="w-full space-y-6 text-white font-sans">
      {/* REPORT HEADER EXHIBIT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#020d1a] via-[#05162a] to-[#010915] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              Morgan Stanley Research Exhibit 3
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
              Data as of 7/24/2026
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-400">
            150+ Global Tickers & Chokepoints
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-amber-200 bg-clip-text text-transparent flex items-center gap-2">
          AI Infrastructure Value Chain Heatmap
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed mt-2">
          Comprehensive quantitative directory and architectural stack mapping power utilities, nuclear co-location, semiconductor foundries, EUV lithography, server ODMs, liquid cooling, and hyperscale compute operators.
        </p>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-cyan-500/20">
          <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              #1 Constraint
            </span>
            <span className="text-sm font-black text-amber-300 flex items-center gap-1 mt-0.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Power & Grid Cap
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">Nuclear & On-site Fuel Cells</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Dominant Foundry
            </span>
            <span className="text-sm font-black text-cyan-300 flex items-center gap-1 mt-0.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              TSMC (TSM)
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">Monopolizes CoWoS Packaging</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Thermal Shift
            </span>
            <span className="text-sm font-black text-emerald-300 flex items-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 text-emerald-400" />
              Direct Liquid Cooling
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">Vertiv, AVC, Schneider</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Monopoly CapEx
            </span>
            <span className="text-sm font-black text-purple-300 flex items-center gap-1 mt-0.5">
              <Building2 className="w-4 h-4 text-purple-400" />
              Hyperscale Cloud
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">AMZN, MSFT, GOOGL, META</span>
          </div>
        </div>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, ticker (e.g., VRT, ASML, TSM), or technology..."
            className="w-full bg-transparent text-xs font-medium text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              triggerHaptic("selection");
              setViewMode("tree");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "tree"
                ? "bg-cyan-500 text-black font-extrabold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Stack Tree
          </button>
          <button
            onClick={() => {
              triggerHaptic("selection");
              setViewMode("grid");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "grid"
                ? "bg-cyan-500 text-black font-extrabold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Company Cards
          </button>
          <button
            onClick={() => {
              triggerHaptic("selection");
              setViewMode("table");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "table"
                ? "bg-cyan-500 text-black font-extrabold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Full Table
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              triggerHaptic("selection");
              setSelectedCategory(cat);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20 font-extrabold"
                : "bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* VIEW MODE 1: ARCHITECTURAL STACK TREE DIAGRAM */}
      {viewMode === "tree" && (
        <div className="space-y-6">
          {/* SECTION 1: POWER & UTILITY FOUNDATION */}
          <div className="p-5 rounded-2xl bg-[#030b14] border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-200">
                    LAYER 1: Power Generation, Grid & Nuclear Co-location
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    The ultimate energy constraint for gigawatt-scale AI clusters
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-lg">
                High Risk Bottleneck
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nuclear */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Nuclear Power Plant
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Behind-Fence</span>
                </div>
                <div className="space-y-1.5">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Nuclear Power Plant"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid & Renewables */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" /> Grid & Renewable Storage
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Utilities</span>
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Grid + Renewables" || d.subCategory === "Grid Infrastructure"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generators & Fuel Cells */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Fuel Cells & Prime Backup
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">On-Site Power</span>
                </div>
                <div className="space-y-1.5">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Fuel Cells" || d.subCategory === "Generators"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SEMICONDUCTOR MANUFACTURING & FABRICATION */}
          <div className="p-5 rounded-2xl bg-[#020b12] border border-cyan-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-cyan-200">
                    LAYER 2: Semiconductor Equipment, Foundries & IC Design
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    EUV lithography monopolies, leading-edge foundries, and custom ASICs
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded-lg">
                Silicon Core
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Semi Cap Equipment */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Semi Capital Equipment
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">EUV & Metrology</span>
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Semi Capital Equipment"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foundry & OSAT */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Foundry & Packaging (OSAT)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">TSM, ASE, Samsung</span>
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Foundry" || d.subCategory === "OSAT"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IC Design & Custom Silicon */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    IC Design & Custom Silicon
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">NVDA, AVGO, AMD</span>
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "IC Design" || d.subCategory === "Semi Design Services"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SERVER BRANDS, LIQUID COOLING & NETWORKING */}
          <div className="p-5 rounded-2xl bg-[#090314] border border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-purple-200">
                    LAYER 3: Server ODMs, Liquid Cooling & High-Speed Networks
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Direct liquid cooling loops, 800G optical transceivers, and server assemblers
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded-lg">
                Cluster Assembly
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Liquid Cooling & Power */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Liquid Cooling & Thermal
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Vertiv, AVC</span>
                </div>
                <div className="space-y-1.5">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Liquid Cooling" || d.subCategory === "Liquid Cooling & UPS" || d.subCategory === "Thermal Solution"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server ODMs & OEMs */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Server ODMs & OEMs
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Foxconn, Dell, Wiwynn</span>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.subCategory === "Server Brands" || d.subCategory === "ODM / EMS"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Networking & Optical */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Networking & DCI Optics
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Arista, Cisco, Coherent</span>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto no-scrollbar">
                  {VALUE_CHAIN_DATA.filter(
                    (d) => d.category === "Network"
                  ).map((co) => (
                    <div
                      key={co.company}
                      className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{co.company}</span>
                      <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {co.ticker}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: COMPANY CARDS GRID */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredData.map((co, idx) => (
            <div
              key={`${co.company}-${idx}`}
              className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {co.company}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      {co.subCategory}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                    {co.ticker}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed mt-2.5 line-clamp-3">
                  {co.whatTheyDo}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Exchange: {co.exchange}</span>
                <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                  View Intel <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: SEARCHABLE FULL TABLE */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/90 text-neutral-400 font-mono uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Ticker</th>
                <th className="p-3.5">Exchange</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Sub-Category</th>
                <th className="p-3.5">What They Do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredData.map((co, idx) => (
                <tr
                  key={`${co.company}-${idx}`}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">
                    {co.company}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {co.ticker}
                  </td>
                  <td className="p-3.5 font-mono text-neutral-400 whitespace-nowrap">
                    {co.exchange}
                  </td>
                  <td className="p-3.5 text-neutral-300 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                      {co.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-amber-300 font-mono text-[11px] whitespace-nowrap">
                    {co.subCategory}
                  </td>
                  <td className="p-3.5 text-neutral-300 text-xs leading-relaxed max-w-md">
                    {co.whatTheyDo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECHARTS DISTRIBUTION VISUALIZATION */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Value Chain Bottleneck Layer Distribution
            </h3>
            <p className="text-[11px] text-neutral-400">
              Number of key market leaders mapped per architectural layer in the Morgan Stanley report
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="name"
                stroke="#a3a3a3"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#22d3ee",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
