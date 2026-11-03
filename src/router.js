// Hash routes, so every page has its own address and the browser's Back button works:
// #/ home · #/explore · #/sell · #/edit/<id> · #/profile
export function parseRoute(hash = location.hash){
 const [page = '', id] = hash.replace(/^#\/?/, '').split('/');
 if(page === 'explore' || page === 'sell' || page === 'profile')return {page};
 if(page === 'edit' && id)return {page, id:decodeURIComponent(id)};
 return {page:'home'};
}

export const go = path => { location.hash = path; };

export const titles = {
 home:'Campus Marketplace | ACL UI/UX',
 explore:'Explore items | Campus Marketplace',
 sell:'Sell an item | Campus Marketplace',
 edit:'Edit listing | Campus Marketplace',
 profile:'Your profile | Campus Marketplace',
};
