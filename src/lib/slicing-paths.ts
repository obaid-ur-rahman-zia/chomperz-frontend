/** Base path for all sliced UI assets under /public/images/Slicing */
const BASE = "/images/Slicing";

function p(...parts: string[]): string {
  return `${BASE}/${parts.map((s) => encodeURIComponent(s)).join("/")}`;
}

export const SLICING = {
  logo: p("logo", "logo.png"),
  navbar: {
    bar: p("Navbar", "Navbar.png"),
    currencyBar: p("Navbar", "Currency bar.png"),
    profileImage: p("Navbar", "Profile image.png"),
    profileNameBar: p("Navbar", "Profile name bar.png"),
    searchBar: p("Navbar", "Search bar.png"),
    searchIcon: p("Navbar", "Search Icon.png"),
  },
  buttons: {
    home: p("Buttons", "Home.png"),
    crib: p("Buttons", "crib.png"),
    shop: p("Buttons", "Shop.png"),
    inventory: p("Buttons", "Inventory.png"),
    map: p("Buttons", "Map.png"),
    leaderboard: p("Buttons", "Leaderboard.png"),
    tabSelected: p("Buttons", "Selected Tab Button.png"),
    tabUnselected: p("Buttons", "unselected Tab Button.png"),
  },
  mainMenu: {
    bg: p("Main menu", "bg.png"),
    characterPanel: p("Main menu", "Main menu character panel.png"),
    activeSkillPanel: p("Main menu", "Ative skill panel.png"),
    statEarningPanel: p("Main menu", "Stat & earning panel.png"),
    earningPanel: p("Main menu", "Panel on woode panel for Earning & stat.png"),
    levelActionReward: p("Main menu", "Level and Action reward Panel.png"),
    button: p("Main menu", "Button.png"),
    progressiveButton: p("Main menu", "Progressive Button.png"),
    connectWallet: p("Main menu", "Connect to wallet button.png"),
    emptyBar: p("Main menu", "Empty Bar.png"),
    fillBar: p("Main menu", "Fill bar.png"),
    power: p("Main menu", "Power.png"),
    speed: p("Main menu", "Speed.png"),
    simpleCoin: p("Main menu", "Simple Coin.png"),
    zCoin: p("Main menu", "Z Coin.png"),
    skillImageBg: p("Main menu", "Skill image BG.png"),
    skillImageBgSelected: p("Main menu", "Selected SKill image bg.png"),
    woodInventoryBar: p("Main menu", "Wood in inventory bar.png"),
    timePanel: p("Main menu", "time panel.png"),
  },
  /** Content insets — titles are baked into panel PNGs */
  dashboardInsets: {
    character: "14% 10% 12% 10%",
    activeSkills: "15% 8% 7% 8%",
    statUpgrade: "15% 9% 9% 9%",
    wallet: "15% 9% 9% 9%",
  },
  skills: {
    bg: p("Skills", "bg.png"),
    panel: p("Skills", "Panel.png"),
    assetPane: p("Skills", "Assets Image pane;.png"),
    detailPanel: p("Skills", "panel for details on wooden panel.png"),
  },
  map: {
    bg: p("Map", "bg.png"),
    woodenPanel: p("Map", "Wooden panel.png"),
    crownPanel: p("Map", "Crown panel.png"),
    ownedPanel: p("Map", "Owned Panel.png"),
    abandonedPanel: p("Map", "Abandoned panel.png"),
    bidBar: p("Map", "bid number ba.png"),
    outbidButton: p("Map", "outbid button.png"),
    renterBar: p("Map", "panel bar for renter.png"),
    playerCardBg: p("Map", "Player name status image earning BG.png"),
  },
  shop: {
    bg: p("Shop", "bg.png"),
    woodenPanel: p("Shop", "Wooden Panel.png"),
    assetBg: p("Shop", "assets image BG.png"),
    buyButton: p("Shop", "buy button.png"),
    dimensionBar: p("Shop", "Dimension bar.png"),
    selectedButton: p("Shop", "Selected button.png"),
    unselectedButton: p("Shop", "unselected button.png"),
  },
  inventory: {
    bg: p("Inventory", "bg.png"),
    woodenPanel: p("Inventory", "Wooden Panel.png"),
    innerPanel: p("Inventory", "panel on wooden panel.png"),
    assetBg: p("Inventory", "asset image BG.png"),
    button: p("Inventory", "button.png"),
  },
  leaderboard: {
    bg: p("Leaderboard", "bg.png"),
    woodenPanel: p("Leaderboard", "Wooden Panel.png"),
    button: p("Leaderboard", "Button.png"),
    rowPanel: p("Leaderboard", "Panel for player Name and position.png"),
    ownRowPanel: p("Leaderboard", "Own position and rank panel.png"),
  },
  crib: {
    assetsBg: p("Crib", "assets bg.png"),
    mainPanel: p("Crib", "Main wooden panel.png"),
    innerPanel: p("Crib", "Panel on wooden panel.png"),
    bottomBar: p("Crib", "Bottom bar.png"),
    buttons: p("Crib", "Buttons.png"),
    cross: p("Crib", "Cross.png"),
    rotate: p("Crib", "Rotate.png"),
    tick: p("Crib", "Tick.png"),
    scrollBar: p("Crib", "Scroll bar.png"),
    scroll: p("Crib", "Scroll.png"),
    correctPlacement: p("Crib", "bg for correct placement.png"),
    wrongPlacement: p("Crib", "bg for wrong placement.png"),
    header: p("Crib", "Header.png"),
  },
  assets: {
    chomperFront: p("assets", "Chomper idol", "Front.png"),
    chomperBack: p("assets", "Chomper idol", "back.png"),
    chomperSide1: p("assets", "Chomper idol", "side1.png"),
    chomperSide2: p("assets", "Chomper idol", "side2.png"),
    woodLog: p("assets", "Resources", "wooden log.png"),
    plank: p("assets", "Resources", "plank.png"),
    ore: p("assets", "Resources", "Ore.png"),
    ironBar: p("assets", "Resources", "Iron bar.png"),
    woodcutting: p("assets", "Resources", "WoodCutting.png"),
    mining: p("assets", "Resources", "Mining.png"),
    carpenter: p("assets", "Resources", "carpenter.png"),
    smithing: p("assets", "Resources", "Smithing.png"),
    woodenFloor: p("assets", "Tiles", "Wooden Floor.png"),
    ironFloor: p("assets", "Tiles", "Iron Floor.png"),
    fancyTiles: p("assets", "Tiles", "Fancy Tiles.png"),
    woodenChair: p("assets", "Wood Furniture", "Wooden chair.png"),
    woodenTable: p("assets", "Wood Furniture", "Table 1.png"),
    ironChair: p("assets", "Iron Furniture", "Iron Chair.png"),
    ironTable: p("assets", "Iron Furniture", "Iron Table.png"),
    fancyChair: p("assets", "Fancy furniture", "Fancy chair front.png"),
    fancyTable: p("assets", "Fancy furniture", "table.png"),
  },
} as const;

export const SKILL_ICONS: Record<string, string> = {
  woodcutting: SLICING.assets.woodcutting,
  mining: SLICING.assets.mining,
  carpentry: SLICING.assets.carpenter,
  smithing: SLICING.assets.smithing,
};

export const RESOURCE_ICONS: Record<string, string> = {
  wood: SLICING.assets.woodLog,
  plank: SLICING.assets.plank,
  ore: SLICING.assets.ore,
  ingot: SLICING.assets.ironBar,
};

export const FURNITURE_IMAGES: Record<string, string> = {
  wood_chair: SLICING.assets.woodenChair,
  wood_table: SLICING.assets.woodenTable,
  wood_floor: SLICING.assets.woodenFloor,
  iron_chair: SLICING.assets.ironChair,
  iron_table: SLICING.assets.ironTable,
  iron_floor: SLICING.assets.ironFloor,
  fancy_chair: SLICING.assets.fancyChair,
  fancy_table: SLICING.assets.fancyTable,
  fancy_floor: SLICING.assets.fancyTiles,
  fancy_statue: SLICING.assets.chomperFront,
};

export const INVENTORY_CARDS = [
  { itemId: "wood", title: "Wood", subtitle: "Raw Wood", source: "Gathered By WoodCutting", action: "Start Cutting", skill: "woodcutting", route: "/dashboard" },
  { itemId: "plank", title: "Plank", subtitle: "Wooden Plank", source: "Crafted By Carpentry", action: "Start Crafting", skill: "carpentry", route: "/dashboard" },
  { itemId: "ore", title: "Ore", subtitle: "Raw Iron Ore", source: "Gathered By Mining", action: "Start Mining", skill: "mining", route: "/dashboard" },
  { itemId: "ingot", title: "Bar", subtitle: "Iron Bars", source: "Crafted By Smithing", action: "Start Smithing", skill: "smithing", route: "/dashboard" },
] as const;

export const PAGE_BACKGROUNDS: Record<string, string> = {
  "/dashboard": SLICING.mainMenu.bg,
  "/skills": SLICING.skills.bg,
  "/map": SLICING.map.bg,
  "/shop": SLICING.shop.bg,
  "/inventory": SLICING.inventory.bg,
  "/leaderboard": SLICING.leaderboard.bg,
  "/crib": SLICING.mainMenu.bg,
  "/profile": SLICING.mainMenu.bg,
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", shortLabel: "Home", icon: SLICING.buttons.home },
  { href: "/crib", label: "Crib", shortLabel: "Crib", icon: SLICING.buttons.crib },
  { href: "/shop", label: "Shop", shortLabel: "Shop", icon: SLICING.buttons.shop },
  { href: "/inventory", label: "Inventory", shortLabel: "Inv", icon: SLICING.buttons.inventory },
  { href: "/map", label: "Map", shortLabel: "Map", icon: SLICING.buttons.map },
  { href: "/leaderboard", label: "Leaderboard", shortLabel: "Rank", icon: SLICING.buttons.leaderboard },
] as const;
