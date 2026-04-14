export const PRODUCTS = [
  {id:1,name:"Wireless Earbuds Pro",sku:"WEP-001",stock:142,pred:310,st:"wn",cat:"Electronics"},
  {id:2,name:"Organic Coffee Blend",sku:"OCB-204",stock:890,pred:720,st:"ok",cat:"Beverages"},
  {id:3,name:"Running Shoes X9",    sku:"RSX-009",stock:34, pred:180,st:"cr",cat:"Footwear"},
  {id:4,name:"Vitamin D3 Capsules", sku:"VDC-112",stock:567,pred:430,st:"ok",cat:"Health"},
  {id:5,name:"Bamboo Notebook Set", sku:"BNS-031",stock:78, pred:200,st:"wn",cat:"Stationery"},
  {id:6,name:"Smart Water Bottle",  sku:"SWB-008",stock:12, pred:95, st:"cr",cat:"Wellness"},
];
export const CHART_DATA = [
  {m:"Jul",a:420,p:410},{m:"Aug",a:380,p:395},{m:"Sep",a:510,p:490},
  {m:"Oct",a:680,p:650},{m:"Nov",a:720,p:710},{m:"Dec",a:940,p:900},
  {m:"Jan",a:520,p:530},{m:"Feb",a:460,p:450},{m:"Mar",a:590,p:580},
  {m:"Apr",a:null,p:640},
];
export const ALERTS = [
  {id:1,t:"cr",  msg:"Running Shoes X9 — critically low (34 units)",       time:"2m ago"},
  {id:2,t:"wn",  msg:"Smart Water Bottle — demand surge predicted (+700%)", time:"8m ago"},
  {id:3,t:"info",msg:"Auto-reorder triggered: Wireless Earbuds Pro",        time:"15m ago"},
  {id:4,t:"ok",  msg:"Bamboo Notebook Set restocked successfully",          time:"1h ago"},
  {id:5,t:"info",msg:"ML model retrained with April sales data",            time:"2h ago"},
];
export const FLOAT_CARDS = [
  {name:"Running Shoes X9", sku:"RSX-009",stock:34, st:"cr",l:55, delay:0,dur:9},
  {name:"Wireless Earbuds", sku:"WEP-001",stock:142,st:"wn",l:190,delay:2,dur:11},
  {name:"Organic Coffee",   sku:"OCB-204",stock:890,st:"ok",l:370,delay:4,dur:8},
  {name:"Vitamin D3 Caps",  sku:"VDC-112",stock:567,st:"ok",l:540,delay:1,dur:13},
  {name:"Bamboo Notebook",  sku:"BNS-031",stock:78, st:"wn",l:110,delay:6,dur:10},
  {name:"Smart Bottle",     sku:"SWB-008",stock:12, st:"cr",l:450,delay:3,dur:12},
  {name:"Coffee Reserve",   sku:"OCB-205",stock:740,st:"ok",l:670,delay:5,dur:9},
];
export const TEAM = [
  {nm:"Mayank Srivastava",rl:"ML Engineer",   av:"MS",g:"linear-gradient(135deg,#8b5cf6,#22d3ee)"},
  {nm:"Bhupendra Singh", rl:"Full-Stack Dev",av:"BS",g:"linear-gradient(135deg,#b8ff57,#22d3ee)"},
  {nm:"Sarthak", rl:"Backend Dev",   av:"S",g:"linear-gradient(135deg,#f43f5e,#f59e0b)"},
  {nm:"Rishab Singh",  rl:"UI/UX Designer",av:"RS",g:"linear-gradient(135deg,#f59e0b,#f43f5e)"},
];
