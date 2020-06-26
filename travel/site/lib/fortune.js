var fortuneCookies=[
    "Conquer your fears or they will conqure you.",
    "River need Springs.",
    "Do not fear what you don't know.",
    "You will have a plaeasant surprise.",
    "Whenever possible,keep it simple.",
]

exports.getFortune=function(){
    var idx=Math.floor(Math.random()*fortuneCookies.length);
    return fortuneCookies[idx];
}