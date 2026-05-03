function cn(e){let n=atob(e),t=n.length,i=new Uint8Array(t);for(let r=0;r<t;r++)i[r]=n.charCodeAt(r);return i}function pe(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let n="",t=e.byteLength;for(let i=0;i<t;i++)n+=String.fromCharCode(e[i]);return btoa(n)}var $r=new Uint8Array(16),sn=class{constructor(e="",n=1e3){this.prefix=e,this.maxCaptureSize=n,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=n=>(...t)=>{let i=this.prefix?[this.prefix,...t]:t;this.originalConsole[n](...i),this.captureLog(n,t)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,n){let t={level:e,timestamp:Date.now(),message:n.map(i=>{if(typeof i=="string")return i;try{return JSON.stringify(i)}catch{return String(i)}}).join(" ")};this.logBuffer.push(t),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,n){if(this.logBuffer.length>0){let i=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i.map(l=>({...l,source:n})))})).ok)throw new Error("Failed to post logs to server")}catch(r){console.warn("Could not post logs to server",r.message),this.logBuffer.unshift(...i)}}}},fe;function fn(e=""){return fe=new sn(e),fe}var j=e=>{throw new Error("Not initialized yet")},Q=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",G=new Map,V=0;Q&&(globalThis.syscall=async(e,...n)=>await new Promise((t,i)=>{V++,G.set(V,{resolve:t,reject:i}),j({type:"sys",id:V,name:e,args:n})}));function de(e,n,t){Q&&(j=t,self.addEventListener("message",i=>{(async()=>{let r=i.data;switch(r.type){case"inv":{let l=e[r.name];if(!l)throw new Error(`Function not loaded: ${r.name}`);try{let o=await Promise.resolve(l(...r.args||[]));j({type:"invr",id:r.id,result:o})}catch(o){console.error("An exception was thrown as a result of invoking function",r.name,"error:",o.message),j({type:"invr",id:r.id,error:o.message})}}break;case"sysr":{let l=r.id,o=G.get(l);if(!o)throw Error("Invalid request id");G.delete(l),r.error?o.reject(new Error(r.error)):o.resolve(r.result)}break}})().catch(console.error)}),j({type:"manifest",manifest:n}),fn(`[${n.name} plug]`))}async function pn(e,n){if(typeof e!="string"){let t=new Uint8Array(await e.arrayBuffer()),i=t.length>0?pe(t):void 0;n={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:i},e=e.url}return syscall("sandboxFetch.fetch",e,n)}globalThis.nativeFetch=globalThis.fetch;function dn(){globalThis.fetch=async(e,n)=>{let t=n?.body?pe(new Uint8Array(await new Response(n.body).arrayBuffer())):void 0,i=await pn(e,n&&{method:n.method,headers:n.headers,base64Body:t});return new Response(i.base64Body?cn(i.base64Body):null,{status:i.status,headers:i.headers})}}Q&&dn();var he=`/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).jsyaml={})}(this,function(e){"use strict";function t(e){return null==e}var n={isNothing:t,isObject:function(e){return"object"==typeof e&&null!==e},toArray:function(e){return Array.isArray(e)?e:t(e)?[]:[e]},repeat:function(e,t){var n,i="";for(n=0;n<t;n+=1)i+=e;return i},isNegativeZero:function(e){return 0===e&&Number.NEGATIVE_INFINITY===1/e},extend:function(e,t){var n,i,r,o;if(t)for(n=0,i=(o=Object.keys(t)).length;n<i;n+=1)e[r=o[n]]=t[r];return e}};function i(e,t){var n="",i=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(n+='in "'+e.mark.name+'" '),n+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!t&&e.mark.snippet&&(n+="\\n\\n"+e.mark.snippet),i+" "+n):i}function r(e,t){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=t,this.message=i(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=(new Error).stack||""}r.prototype=Object.create(Error.prototype),r.prototype.constructor=r,r.prototype.toString=function(e){return this.name+": "+i(this,e)};var o=r;function a(e,t,n,i,r){var o="",a="",l=Math.floor(r/2)-1;return i-t>l&&(t=i-l+(o=" ... ").length),n-i>l&&(n=i+l-(a=" ...").length),{str:o+e.slice(t,n).replace(/\\t/g,"\u2192")+a,pos:i-t+o.length}}function l(e,t){return n.repeat(" ",t-e.length)+e}var c=function(e,t){if(t=Object.create(t||null),!e.buffer)return null;t.maxLength||(t.maxLength=79),"number"!=typeof t.indent&&(t.indent=1),"number"!=typeof t.linesBefore&&(t.linesBefore=3),"number"!=typeof t.linesAfter&&(t.linesAfter=2);for(var i,r=/\\r?\\n|\\r|\\0/g,o=[0],c=[],s=-1;i=r.exec(e.buffer);)c.push(i.index),o.push(i.index+i[0].length),e.position<=i.index&&s<0&&(s=o.length-2);s<0&&(s=o.length-1);var u,p,f="",d=Math.min(e.line+t.linesAfter,c.length).toString().length,h=t.maxLength-(t.indent+d+3);for(u=1;u<=t.linesBefore&&!(s-u<0);u++)p=a(e.buffer,o[s-u],c[s-u],e.position-(o[s]-o[s-u]),h),f=n.repeat(" ",t.indent)+l((e.line-u+1).toString(),d)+" | "+p.str+"\\n"+f;for(p=a(e.buffer,o[s],c[s],e.position,h),f+=n.repeat(" ",t.indent)+l((e.line+1).toString(),d)+" | "+p.str+"\\n",f+=n.repeat("-",t.indent+d+3+p.pos)+"^\\n",u=1;u<=t.linesAfter&&!(s+u>=c.length);u++)p=a(e.buffer,o[s+u],c[s+u],e.position-(o[s]-o[s+u]),h),f+=n.repeat(" ",t.indent)+l((e.line+u+1).toString(),d)+" | "+p.str+"\\n";return f.replace(/\\n$/,"")},s=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],u=["scalar","sequence","mapping"];var p=function(e,t){if(t=t||{},Object.keys(t).forEach(function(t){if(-1===s.indexOf(t))throw new o('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.options=t,this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(e){return e},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.representName=t.representName||null,this.defaultStyle=t.defaultStyle||null,this.multi=t.multi||!1,this.styleAliases=function(e){var t={};return null!==e&&Object.keys(e).forEach(function(n){e[n].forEach(function(e){t[String(e)]=n})}),t}(t.styleAliases||null),-1===u.indexOf(this.kind))throw new o('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')};function f(e,t){var n=[];return e[t].forEach(function(e){var t=n.length;n.forEach(function(n,i){n.tag===e.tag&&n.kind===e.kind&&n.multi===e.multi&&(t=i)}),n[t]=e}),n}function d(e){return this.extend(e)}d.prototype.extend=function(e){var t=[],n=[];if(e instanceof p)n.push(e);else if(Array.isArray(e))n=n.concat(e);else{if(!e||!Array.isArray(e.implicit)&&!Array.isArray(e.explicit))throw new o("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");e.implicit&&(t=t.concat(e.implicit)),e.explicit&&(n=n.concat(e.explicit))}t.forEach(function(e){if(!(e instanceof p))throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(e.loadKind&&"scalar"!==e.loadKind)throw new o("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(e.multi)throw new o("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),n.forEach(function(e){if(!(e instanceof p))throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var i=Object.create(d.prototype);return i.implicit=(this.implicit||[]).concat(t),i.explicit=(this.explicit||[]).concat(n),i.compiledImplicit=f(i,"implicit"),i.compiledExplicit=f(i,"explicit"),i.compiledTypeMap=function(){var e,t,n={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}};function i(e){e.multi?(n.multi[e.kind].push(e),n.multi.fallback.push(e)):n[e.kind][e.tag]=n.fallback[e.tag]=e}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(i);return n}(i.compiledImplicit,i.compiledExplicit),i};var h=d,g=new p("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return null!==e?e:""}}),m=new p("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return null!==e?e:[]}}),y=new p("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return null!==e?e:{}}}),b=new h({explicit:[g,m,y]});var A=new p("tag:yaml.org,2002:null",{kind:"scalar",resolve:function(e){if(null===e)return!0;var t=e.length;return 1===t&&"~"===e||4===t&&("null"===e||"Null"===e||"NULL"===e)},construct:function(){return null},predicate:function(e){return null===e},represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});var v=new p("tag:yaml.org,2002:bool",{kind:"scalar",resolve:function(e){if(null===e)return!1;var t=e.length;return 4===t&&("true"===e||"True"===e||"TRUE"===e)||5===t&&("false"===e||"False"===e||"FALSE"===e)},construct:function(e){return"true"===e||"True"===e||"TRUE"===e},predicate:function(e){return"[object Boolean]"===Object.prototype.toString.call(e)},represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function w(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function k(e){return 48<=e&&e<=55}function C(e){return 48<=e&&e<=57}var x=new p("tag:yaml.org,2002:int",{kind:"scalar",resolve:function(e){if(null===e)return!1;var t,n=e.length,i=0,r=!1;if(!n)return!1;if("-"!==(t=e[i])&&"+"!==t||(t=e[++i]),"0"===t){if(i+1===n)return!0;if("b"===(t=e[++i])){for(i++;i<n;i++)if("_"!==(t=e[i])){if("0"!==t&&"1"!==t)return!1;r=!0}return r&&"_"!==t}if("x"===t){for(i++;i<n;i++)if("_"!==(t=e[i])){if(!w(e.charCodeAt(i)))return!1;r=!0}return r&&"_"!==t}if("o"===t){for(i++;i<n;i++)if("_"!==(t=e[i])){if(!k(e.charCodeAt(i)))return!1;r=!0}return r&&"_"!==t}}if("_"===t)return!1;for(;i<n;i++)if("_"!==(t=e[i])){if(!C(e.charCodeAt(i)))return!1;r=!0}return!(!r||"_"===t)},construct:function(e){var t,n=e,i=1;if(-1!==n.indexOf("_")&&(n=n.replace(/_/g,"")),"-"!==(t=n[0])&&"+"!==t||("-"===t&&(i=-1),t=(n=n.slice(1))[0]),"0"===n)return 0;if("0"===t){if("b"===n[1])return i*parseInt(n.slice(2),2);if("x"===n[1])return i*parseInt(n.slice(2),16);if("o"===n[1])return i*parseInt(n.slice(2),8)}return i*parseInt(n,10)},predicate:function(e){return"[object Number]"===Object.prototype.toString.call(e)&&e%1==0&&!n.isNegativeZero(e)},represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),I=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\\\.(?:inf|Inf|INF)|\\\\.(?:nan|NaN|NAN))$");var S=/^[-+]?[0-9]+e/;var O=new p("tag:yaml.org,2002:float",{kind:"scalar",resolve:function(e){return null!==e&&!(!I.test(e)||"_"===e[e.length-1])},construct:function(e){var t,n;return n="-"===(t=e.replace(/_/g,"").toLowerCase())[0]?-1:1,"+-".indexOf(t[0])>=0&&(t=t.slice(1)),".inf"===t?1===n?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:".nan"===t?NaN:n*parseFloat(t,10)},predicate:function(e){return"[object Number]"===Object.prototype.toString.call(e)&&(e%1!=0||n.isNegativeZero(e))},represent:function(e,t){var i;if(isNaN(e))switch(t){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(t){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(t){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(n.isNegativeZero(e))return"-0.0";return i=e.toString(10),S.test(i)?i.replace("e",".e"):i},defaultStyle:"lowercase"}),j=b.extend({implicit:[A,v,x,O]}),T=j,N=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),F=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\\\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\\\.([0-9]*))?(?:[ \\\\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");var E=new p("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:function(e){return null!==e&&(null!==N.exec(e)||null!==F.exec(e))},construct:function(e){var t,n,i,r,o,a,l,c,s=0,u=null;if(null===(t=N.exec(e))&&(t=F.exec(e)),null===t)throw new Error("Date resolve error");if(n=+t[1],i=+t[2]-1,r=+t[3],!t[4])return new Date(Date.UTC(n,i,r));if(o=+t[4],a=+t[5],l=+t[6],t[7]){for(s=t[7].slice(0,3);s.length<3;)s+="0";s=+s}return t[9]&&(u=6e4*(60*+t[10]+ +(t[11]||0)),"-"===t[9]&&(u=-u)),c=new Date(Date.UTC(n,i,r,o,a,l,s)),u&&c.setTime(c.getTime()-u),c},instanceOf:Date,represent:function(e){return e.toISOString()}});var M=new p("tag:yaml.org,2002:merge",{kind:"scalar",resolve:function(e){return"<<"===e||null===e}}),L="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\\n\\r";var _=new p("tag:yaml.org,2002:binary",{kind:"scalar",resolve:function(e){if(null===e)return!1;var t,n,i=0,r=e.length,o=L;for(n=0;n<r;n++)if(!((t=o.indexOf(e.charAt(n)))>64)){if(t<0)return!1;i+=6}return i%8==0},construct:function(e){var t,n,i=e.replace(/[\\r\\n=]/g,""),r=i.length,o=L,a=0,l=[];for(t=0;t<r;t++)t%4==0&&t&&(l.push(a>>16&255),l.push(a>>8&255),l.push(255&a)),a=a<<6|o.indexOf(i.charAt(t));return 0===(n=r%4*6)?(l.push(a>>16&255),l.push(a>>8&255),l.push(255&a)):18===n?(l.push(a>>10&255),l.push(a>>2&255)):12===n&&l.push(a>>4&255),new Uint8Array(l)},predicate:function(e){return"[object Uint8Array]"===Object.prototype.toString.call(e)},represent:function(e){var t,n,i="",r=0,o=e.length,a=L;for(t=0;t<o;t++)t%3==0&&t&&(i+=a[r>>18&63],i+=a[r>>12&63],i+=a[r>>6&63],i+=a[63&r]),r=(r<<8)+e[t];return 0===(n=o%3)?(i+=a[r>>18&63],i+=a[r>>12&63],i+=a[r>>6&63],i+=a[63&r]):2===n?(i+=a[r>>10&63],i+=a[r>>4&63],i+=a[r<<2&63],i+=a[64]):1===n&&(i+=a[r>>2&63],i+=a[r<<4&63],i+=a[64],i+=a[64]),i}}),D=Object.prototype.hasOwnProperty,U=Object.prototype.toString;var q=new p("tag:yaml.org,2002:omap",{kind:"sequence",resolve:function(e){if(null===e)return!0;var t,n,i,r,o,a=[],l=e;for(t=0,n=l.length;t<n;t+=1){if(i=l[t],o=!1,"[object Object]"!==U.call(i))return!1;for(r in i)if(D.call(i,r)){if(o)return!1;o=!0}if(!o)return!1;if(-1!==a.indexOf(r))return!1;a.push(r)}return!0},construct:function(e){return null!==e?e:[]}}),Y=Object.prototype.toString;var R=new p("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:function(e){if(null===e)return!0;var t,n,i,r,o,a=e;for(o=new Array(a.length),t=0,n=a.length;t<n;t+=1){if(i=a[t],"[object Object]"!==Y.call(i))return!1;if(1!==(r=Object.keys(i)).length)return!1;o[t]=[r[0],i[r[0]]]}return!0},construct:function(e){if(null===e)return[];var t,n,i,r,o,a=e;for(o=new Array(a.length),t=0,n=a.length;t<n;t+=1)i=a[t],r=Object.keys(i),o[t]=[r[0],i[r[0]]];return o}}),B=Object.prototype.hasOwnProperty;var K=new p("tag:yaml.org,2002:set",{kind:"mapping",resolve:function(e){if(null===e)return!0;var t,n=e;for(t in n)if(B.call(n,t)&&null!==n[t])return!1;return!0},construct:function(e){return null!==e?e:{}}}),P=T.extend({implicit:[E,M],explicit:[_,q,R,K]}),W=Object.prototype.hasOwnProperty,H=/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F-\\x84\\x86-\\x9F\\uFFFE\\uFFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]/,$=/[\\x85\\u2028\\u2029]/,G=/[,\\[\\]\\{\\}]/,V=/^(?:!|!!|![a-z\\-]+!)$/i,Z=/^(?:!|[^,\\[\\]\\{\\}])(?:%[0-9a-f]{2}|[0-9a-z\\-#;\\/\\?:@&=\\+\\$,_\\.!~\\*'\\(\\)\\[\\]])*$/i;function J(e){return Object.prototype.toString.call(e)}function Q(e){return 10===e||13===e}function z(e){return 9===e||32===e}function X(e){return 9===e||32===e||10===e||13===e}function ee(e){return 44===e||91===e||93===e||123===e||125===e}function te(e){var t;return 48<=e&&e<=57?e-48:97<=(t=32|e)&&t<=102?t-97+10:-1}function ne(e){return 120===e?2:117===e?4:85===e?8:0}function ie(e){return 48<=e&&e<=57?e-48:-1}function re(e){return 48===e?"\\0":97===e?"\x07":98===e?"\\b":116===e||9===e?"\\t":110===e?"\\n":118===e?"\\v":102===e?"\\f":114===e?"\\r":101===e?"\x1B":32===e?" ":34===e?'"':47===e?"/":92===e?"\\\\":78===e?"\x85":95===e?"\xA0":76===e?"\\u2028":80===e?"\\u2029":""}function oe(e){return e<=65535?String.fromCharCode(e):String.fromCharCode(55296+(e-65536>>10),56320+(e-65536&1023))}function ae(e,t,n){"__proto__"===t?Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:n}):e[t]=n}for(var le=new Array(256),ce=new Array(256),se=0;se<256;se++)le[se]=re(se)?1:0,ce[se]=re(se);function ue(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||P,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function pe(e,t){var n={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return n.snippet=c(n),new o(t,n)}function fe(e,t){throw pe(e,t)}function de(e,t){e.onWarning&&e.onWarning.call(null,pe(e,t))}var he={YAML:function(e,t,n){var i,r,o;null!==e.version&&fe(e,"duplication of %YAML directive"),1!==n.length&&fe(e,"YAML directive accepts exactly one argument"),null===(i=/^([0-9]+)\\.([0-9]+)$/.exec(n[0]))&&fe(e,"ill-formed argument of the YAML directive"),r=parseInt(i[1],10),o=parseInt(i[2],10),1!==r&&fe(e,"unacceptable YAML version of the document"),e.version=n[0],e.checkLineBreaks=o<2,1!==o&&2!==o&&de(e,"unsupported YAML version of the document")},TAG:function(e,t,n){var i,r;2!==n.length&&fe(e,"TAG directive accepts exactly two arguments"),i=n[0],r=n[1],V.test(i)||fe(e,"ill-formed tag handle (first argument) of the TAG directive"),W.call(e.tagMap,i)&&fe(e,'there is a previously declared suffix for "'+i+'" tag handle'),Z.test(r)||fe(e,"ill-formed tag prefix (second argument) of the TAG directive");try{r=decodeURIComponent(r)}catch(t){fe(e,"tag prefix is malformed: "+r)}e.tagMap[i]=r}};function ge(e,t,n,i){var r,o,a,l;if(t<n){if(l=e.input.slice(t,n),i)for(r=0,o=l.length;r<o;r+=1)9===(a=l.charCodeAt(r))||32<=a&&a<=1114111||fe(e,"expected valid JSON character");else H.test(l)&&fe(e,"the stream contains non-printable characters");e.result+=l}}function me(e,t,i,r){var o,a,l,c;for(n.isObject(i)||fe(e,"cannot merge mappings; the provided source object is unacceptable"),l=0,c=(o=Object.keys(i)).length;l<c;l+=1)a=o[l],W.call(t,a)||(ae(t,a,i[a]),r[a]=!0)}function ye(e,t,n,i,r,o,a,l,c){var s,u;if(Array.isArray(r))for(s=0,u=(r=Array.prototype.slice.call(r)).length;s<u;s+=1)Array.isArray(r[s])&&fe(e,"nested arrays are not supported inside keys"),"object"==typeof r&&"[object Object]"===J(r[s])&&(r[s]="[object Object]");if("object"==typeof r&&"[object Object]"===J(r)&&(r="[object Object]"),r=String(r),null===t&&(t={}),"tag:yaml.org,2002:merge"===i)if(Array.isArray(o))for(s=0,u=o.length;s<u;s+=1)me(e,t,o[s],n);else me(e,t,o,n);else e.json||W.call(n,r)||!W.call(t,r)||(e.line=a||e.line,e.lineStart=l||e.lineStart,e.position=c||e.position,fe(e,"duplicated mapping key")),ae(t,r,o),delete n[r];return t}function be(e){var t;10===(t=e.input.charCodeAt(e.position))?e.position++:13===t?(e.position++,10===e.input.charCodeAt(e.position)&&e.position++):fe(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function Ae(e,t,n){for(var i=0,r=e.input.charCodeAt(e.position);0!==r;){for(;z(r);)9===r&&-1===e.firstTabInLine&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&35===r)do{r=e.input.charCodeAt(++e.position)}while(10!==r&&13!==r&&0!==r);if(!Q(r))break;for(be(e),r=e.input.charCodeAt(e.position),i++,e.lineIndent=0;32===r;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return-1!==n&&0!==i&&e.lineIndent<n&&de(e,"deficient indentation"),i}function ve(e){var t,n=e.position;return!(45!==(t=e.input.charCodeAt(n))&&46!==t||t!==e.input.charCodeAt(n+1)||t!==e.input.charCodeAt(n+2)||(n+=3,0!==(t=e.input.charCodeAt(n))&&!X(t)))}function we(e,t){1===t?e.result+=" ":t>1&&(e.result+=n.repeat("\\n",t-1))}function ke(e,t){var n,i,r=e.tag,o=e.anchor,a=[],l=!1;if(-1!==e.firstTabInLine)return!1;for(null!==e.anchor&&(e.anchorMap[e.anchor]=a),i=e.input.charCodeAt(e.position);0!==i&&(-1!==e.firstTabInLine&&(e.position=e.firstTabInLine,fe(e,"tab characters must not be used in indentation")),45===i)&&X(e.input.charCodeAt(e.position+1));)if(l=!0,e.position++,Ae(e,!0,-1)&&e.lineIndent<=t)a.push(null),i=e.input.charCodeAt(e.position);else if(n=e.line,Ie(e,t,3,!1,!0),a.push(e.result),Ae(e,!0,-1),i=e.input.charCodeAt(e.position),(e.line===n||e.lineIndent>t)&&0!==i)fe(e,"bad indentation of a sequence entry");else if(e.lineIndent<t)break;return!!l&&(e.tag=r,e.anchor=o,e.kind="sequence",e.result=a,!0)}function Ce(e){var t,n,i,r,o=!1,a=!1;if(33!==(r=e.input.charCodeAt(e.position)))return!1;if(null!==e.tag&&fe(e,"duplication of a tag property"),60===(r=e.input.charCodeAt(++e.position))?(o=!0,r=e.input.charCodeAt(++e.position)):33===r?(a=!0,n="!!",r=e.input.charCodeAt(++e.position)):n="!",t=e.position,o){do{r=e.input.charCodeAt(++e.position)}while(0!==r&&62!==r);e.position<e.length?(i=e.input.slice(t,e.position),r=e.input.charCodeAt(++e.position)):fe(e,"unexpected end of the stream within a verbatim tag")}else{for(;0!==r&&!X(r);)33===r&&(a?fe(e,"tag suffix cannot contain exclamation marks"):(n=e.input.slice(t-1,e.position+1),V.test(n)||fe(e,"named tag handle cannot contain such characters"),a=!0,t=e.position+1)),r=e.input.charCodeAt(++e.position);i=e.input.slice(t,e.position),G.test(i)&&fe(e,"tag suffix cannot contain flow indicator characters")}i&&!Z.test(i)&&fe(e,"tag name cannot contain such characters: "+i);try{i=decodeURIComponent(i)}catch(t){fe(e,"tag name is malformed: "+i)}return o?e.tag=i:W.call(e.tagMap,n)?e.tag=e.tagMap[n]+i:"!"===n?e.tag="!"+i:"!!"===n?e.tag="tag:yaml.org,2002:"+i:fe(e,'undeclared tag handle "'+n+'"'),!0}function xe(e){var t,n;if(38!==(n=e.input.charCodeAt(e.position)))return!1;for(null!==e.anchor&&fe(e,"duplication of an anchor property"),n=e.input.charCodeAt(++e.position),t=e.position;0!==n&&!X(n)&&!ee(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&fe(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(t,e.position),!0}function Ie(e,t,i,r,o){var a,l,c,s,u,p,f,d,h,g=1,m=!1,y=!1;if(null!==e.listener&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=l=c=4===i||3===i,r&&Ae(e,!0,-1)&&(m=!0,e.lineIndent>t?g=1:e.lineIndent===t?g=0:e.lineIndent<t&&(g=-1)),1===g)for(;Ce(e)||xe(e);)Ae(e,!0,-1)?(m=!0,c=a,e.lineIndent>t?g=1:e.lineIndent===t?g=0:e.lineIndent<t&&(g=-1)):c=!1;if(c&&(c=m||o),1!==g&&4!==i||(d=1===i||2===i?t:t+1,h=e.position-e.lineStart,1===g?c&&(ke(e,h)||function(e,t,n){var i,r,o,a,l,c,s,u=e.tag,p=e.anchor,f={},d=Object.create(null),h=null,g=null,m=null,y=!1,b=!1;if(-1!==e.firstTabInLine)return!1;for(null!==e.anchor&&(e.anchorMap[e.anchor]=f),s=e.input.charCodeAt(e.position);0!==s;){if(y||-1===e.firstTabInLine||(e.position=e.firstTabInLine,fe(e,"tab characters must not be used in indentation")),i=e.input.charCodeAt(e.position+1),o=e.line,63!==s&&58!==s||!X(i)){if(a=e.line,l=e.lineStart,c=e.position,!Ie(e,n,2,!1,!0))break;if(e.line===o){for(s=e.input.charCodeAt(e.position);z(s);)s=e.input.charCodeAt(++e.position);if(58===s)X(s=e.input.charCodeAt(++e.position))||fe(e,"a whitespace character is expected after the key-value separator within a block mapping"),y&&(ye(e,f,d,h,g,null,a,l,c),h=g=m=null),b=!0,y=!1,r=!1,h=e.tag,g=e.result;else{if(!b)return e.tag=u,e.anchor=p,!0;fe(e,"can not read an implicit mapping pair; a colon is missed")}}else{if(!b)return e.tag=u,e.anchor=p,!0;fe(e,"can not read a block mapping entry; a multiline key may not be an implicit key")}}else 63===s?(y&&(ye(e,f,d,h,g,null,a,l,c),h=g=m=null),b=!0,y=!0,r=!0):y?(y=!1,r=!0):fe(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,s=i;if((e.line===o||e.lineIndent>t)&&(y&&(a=e.line,l=e.lineStart,c=e.position),Ie(e,t,4,!0,r)&&(y?g=e.result:m=e.result),y||(ye(e,f,d,h,g,m,a,l,c),h=g=m=null),Ae(e,!0,-1),s=e.input.charCodeAt(e.position)),(e.line===o||e.lineIndent>t)&&0!==s)fe(e,"bad indentation of a mapping entry");else if(e.lineIndent<t)break}return y&&ye(e,f,d,h,g,null,a,l,c),b&&(e.tag=u,e.anchor=p,e.kind="mapping",e.result=f),b}(e,h,d))||function(e,t){var n,i,r,o,a,l,c,s,u,p,f,d,h=!0,g=e.tag,m=e.anchor,y=Object.create(null);if(91===(d=e.input.charCodeAt(e.position)))a=93,s=!1,o=[];else{if(123!==d)return!1;a=125,s=!0,o={}}for(null!==e.anchor&&(e.anchorMap[e.anchor]=o),d=e.input.charCodeAt(++e.position);0!==d;){if(Ae(e,!0,t),(d=e.input.charCodeAt(e.position))===a)return e.position++,e.tag=g,e.anchor=m,e.kind=s?"mapping":"sequence",e.result=o,!0;h?44===d&&fe(e,"expected the node content, but found ','"):fe(e,"missed comma between flow collection entries"),f=null,l=c=!1,63===d&&X(e.input.charCodeAt(e.position+1))&&(l=c=!0,e.position++,Ae(e,!0,t)),n=e.line,i=e.lineStart,r=e.position,Ie(e,t,1,!1,!0),p=e.tag,u=e.result,Ae(e,!0,t),d=e.input.charCodeAt(e.position),!c&&e.line!==n||58!==d||(l=!0,d=e.input.charCodeAt(++e.position),Ae(e,!0,t),Ie(e,t,1,!1,!0),f=e.result),s?ye(e,o,y,p,u,f,n,i,r):l?o.push(ye(e,null,y,p,u,f,n,i,r)):o.push(u),Ae(e,!0,t),44===(d=e.input.charCodeAt(e.position))?(h=!0,d=e.input.charCodeAt(++e.position)):h=!1}fe(e,"unexpected end of the stream within a flow collection")}(e,d)?y=!0:(l&&function(e,t){var i,r,o,a,l=1,c=!1,s=!1,u=t,p=0,f=!1;if(124===(a=e.input.charCodeAt(e.position)))r=!1;else{if(62!==a)return!1;r=!0}for(e.kind="scalar",e.result="";0!==a;)if(43===(a=e.input.charCodeAt(++e.position))||45===a)1===l?l=43===a?3:2:fe(e,"repeat of a chomping mode identifier");else{if(!((o=ie(a))>=0))break;0===o?fe(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?fe(e,"repeat of an indentation width identifier"):(u=t+o-1,s=!0)}if(z(a)){do{a=e.input.charCodeAt(++e.position)}while(z(a));if(35===a)do{a=e.input.charCodeAt(++e.position)}while(!Q(a)&&0!==a)}for(;0!==a;){for(be(e),e.lineIndent=0,a=e.input.charCodeAt(e.position);(!s||e.lineIndent<u)&&32===a;)e.lineIndent++,a=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>u&&(u=e.lineIndent),Q(a))p++;else{if(e.lineIndent<u){3===l?e.result+=n.repeat("\\n",c?1+p:p):1===l&&c&&(e.result+="\\n");break}for(r?z(a)?(f=!0,e.result+=n.repeat("\\n",c?1+p:p)):f?(f=!1,e.result+=n.repeat("\\n",p+1)):0===p?c&&(e.result+=" "):e.result+=n.repeat("\\n",p):e.result+=n.repeat("\\n",c?1+p:p),c=!0,s=!0,p=0,i=e.position;!Q(a)&&0!==a;)a=e.input.charCodeAt(++e.position);ge(e,i,e.position,!1)}}return!0}(e,d)||function(e,t){var n,i,r;if(39!==(n=e.input.charCodeAt(e.position)))return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;0!==(n=e.input.charCodeAt(e.position));)if(39===n){if(ge(e,i,e.position,!0),39!==(n=e.input.charCodeAt(++e.position)))return!0;i=e.position,e.position++,r=e.position}else Q(n)?(ge(e,i,r,!0),we(e,Ae(e,!1,t)),i=r=e.position):e.position===e.lineStart&&ve(e)?fe(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);fe(e,"unexpected end of the stream within a single quoted scalar")}(e,d)||function(e,t){var n,i,r,o,a,l;if(34!==(l=e.input.charCodeAt(e.position)))return!1;for(e.kind="scalar",e.result="",e.position++,n=i=e.position;0!==(l=e.input.charCodeAt(e.position));){if(34===l)return ge(e,n,e.position,!0),e.position++,!0;if(92===l){if(ge(e,n,e.position,!0),Q(l=e.input.charCodeAt(++e.position)))Ae(e,!1,t);else if(l<256&&le[l])e.result+=ce[l],e.position++;else if((a=ne(l))>0){for(r=a,o=0;r>0;r--)(a=te(l=e.input.charCodeAt(++e.position)))>=0?o=(o<<4)+a:fe(e,"expected hexadecimal character");e.result+=oe(o),e.position++}else fe(e,"unknown escape sequence");n=i=e.position}else Q(l)?(ge(e,n,i,!0),we(e,Ae(e,!1,t)),n=i=e.position):e.position===e.lineStart&&ve(e)?fe(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}fe(e,"unexpected end of the stream within a double quoted scalar")}(e,d)?y=!0:!function(e){var t,n,i;if(42!==(i=e.input.charCodeAt(e.position)))return!1;for(i=e.input.charCodeAt(++e.position),t=e.position;0!==i&&!X(i)&&!ee(i);)i=e.input.charCodeAt(++e.position);return e.position===t&&fe(e,"name of an alias node must contain at least one character"),n=e.input.slice(t,e.position),W.call(e.anchorMap,n)||fe(e,'unidentified alias "'+n+'"'),e.result=e.anchorMap[n],Ae(e,!0,-1),!0}(e)?function(e,t,n){var i,r,o,a,l,c,s,u,p=e.kind,f=e.result;if(X(u=e.input.charCodeAt(e.position))||ee(u)||35===u||38===u||42===u||33===u||124===u||62===u||39===u||34===u||37===u||64===u||96===u)return!1;if((63===u||45===u)&&(X(i=e.input.charCodeAt(e.position+1))||n&&ee(i)))return!1;for(e.kind="scalar",e.result="",r=o=e.position,a=!1;0!==u;){if(58===u){if(X(i=e.input.charCodeAt(e.position+1))||n&&ee(i))break}else if(35===u){if(X(e.input.charCodeAt(e.position-1)))break}else{if(e.position===e.lineStart&&ve(e)||n&&ee(u))break;if(Q(u)){if(l=e.line,c=e.lineStart,s=e.lineIndent,Ae(e,!1,-1),e.lineIndent>=t){a=!0,u=e.input.charCodeAt(e.position);continue}e.position=o,e.line=l,e.lineStart=c,e.lineIndent=s;break}}a&&(ge(e,r,o,!1),we(e,e.line-l),r=o=e.position,a=!1),z(u)||(o=e.position+1),u=e.input.charCodeAt(++e.position)}return ge(e,r,o,!1),!!e.result||(e.kind=p,e.result=f,!1)}(e,d,1===i)&&(y=!0,null===e.tag&&(e.tag="?")):(y=!0,null===e.tag&&null===e.anchor||fe(e,"alias node should not have any properties")),null!==e.anchor&&(e.anchorMap[e.anchor]=e.result)):0===g&&(y=c&&ke(e,h))),null===e.tag)null!==e.anchor&&(e.anchorMap[e.anchor]=e.result);else if("?"===e.tag){for(null!==e.result&&"scalar"!==e.kind&&fe(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),s=0,u=e.implicitTypes.length;s<u;s+=1)if((f=e.implicitTypes[s]).resolve(e.result)){e.result=f.construct(e.result),e.tag=f.tag,null!==e.anchor&&(e.anchorMap[e.anchor]=e.result);break}}else if("!"!==e.tag){if(W.call(e.typeMap[e.kind||"fallback"],e.tag))f=e.typeMap[e.kind||"fallback"][e.tag];else for(f=null,s=0,u=(p=e.typeMap.multi[e.kind||"fallback"]).length;s<u;s+=1)if(e.tag.slice(0,p[s].tag.length)===p[s].tag){f=p[s];break}f||fe(e,"unknown tag !<"+e.tag+">"),null!==e.result&&f.kind!==e.kind&&fe(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+f.kind+'", not "'+e.kind+'"'),f.resolve(e.result,e.tag)?(e.result=f.construct(e.result,e.tag),null!==e.anchor&&(e.anchorMap[e.anchor]=e.result)):fe(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return null!==e.listener&&e.listener("close",e),null!==e.tag||null!==e.anchor||y}function Se(e){var t,n,i,r,o=e.position,a=!1;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);0!==(r=e.input.charCodeAt(e.position))&&(Ae(e,!0,-1),r=e.input.charCodeAt(e.position),!(e.lineIndent>0||37!==r));){for(a=!0,r=e.input.charCodeAt(++e.position),t=e.position;0!==r&&!X(r);)r=e.input.charCodeAt(++e.position);for(i=[],(n=e.input.slice(t,e.position)).length<1&&fe(e,"directive name must not be less than one character in length");0!==r;){for(;z(r);)r=e.input.charCodeAt(++e.position);if(35===r){do{r=e.input.charCodeAt(++e.position)}while(0!==r&&!Q(r));break}if(Q(r))break;for(t=e.position;0!==r&&!X(r);)r=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}0!==r&&be(e),W.call(he,n)?he[n](e,n,i):de(e,'unknown document directive "'+n+'"')}Ae(e,!0,-1),0===e.lineIndent&&45===e.input.charCodeAt(e.position)&&45===e.input.charCodeAt(e.position+1)&&45===e.input.charCodeAt(e.position+2)?(e.position+=3,Ae(e,!0,-1)):a&&fe(e,"directives end mark is expected"),Ie(e,e.lineIndent-1,4,!1,!0),Ae(e,!0,-1),e.checkLineBreaks&&$.test(e.input.slice(o,e.position))&&de(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&ve(e)?46===e.input.charCodeAt(e.position)&&(e.position+=3,Ae(e,!0,-1)):e.position<e.length-1&&fe(e,"end of the stream or a document separator is expected")}function Oe(e,t){t=t||{},0!==(e=String(e)).length&&(10!==e.charCodeAt(e.length-1)&&13!==e.charCodeAt(e.length-1)&&(e+="\\n"),65279===e.charCodeAt(0)&&(e=e.slice(1)));var n=new ue(e,t),i=e.indexOf("\\0");for(-1!==i&&(n.position=i,fe(n,"null byte is not allowed in input")),n.input+="\\0";32===n.input.charCodeAt(n.position);)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)Se(n);return n.documents}var je={loadAll:function(e,t,n){null!==t&&"object"==typeof t&&void 0===n&&(n=t,t=null);var i=Oe(e,n);if("function"!=typeof t)return i;for(var r=0,o=i.length;r<o;r+=1)t(i[r])},load:function(e,t){var n=Oe(e,t);if(0!==n.length){if(1===n.length)return n[0];throw new o("expected a single document in the stream, but found more")}}},Te=Object.prototype.toString,Ne=Object.prototype.hasOwnProperty,Fe=65279,Ee={0:"\\\\0",7:"\\\\a",8:"\\\\b",9:"\\\\t",10:"\\\\n",11:"\\\\v",12:"\\\\f",13:"\\\\r",27:"\\\\e",34:'\\\\"',92:"\\\\\\\\",133:"\\\\N",160:"\\\\_",8232:"\\\\L",8233:"\\\\P"},Me=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],Le=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\\.[0-9_]*)?$/;function _e(e){var t,i,r;if(t=e.toString(16).toUpperCase(),e<=255)i="x",r=2;else if(e<=65535)i="u",r=4;else{if(!(e<=4294967295))throw new o("code point within a string may not be greater than 0xFFFFFFFF");i="U",r=8}return"\\\\"+i+n.repeat("0",r-t.length)+t}function De(e){this.schema=e.schema||P,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=n.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=function(e,t){var n,i,r,o,a,l,c;if(null===t)return{};for(n={},r=0,o=(i=Object.keys(t)).length;r<o;r+=1)a=i[r],l=String(t[a]),"!!"===a.slice(0,2)&&(a="tag:yaml.org,2002:"+a.slice(2)),(c=e.compiledTypeMap.fallback[a])&&Ne.call(c.styleAliases,l)&&(l=c.styleAliases[l]),n[a]=l;return n}(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType='"'===e.quotingType?2:1,this.forceQuotes=e.forceQuotes||!1,this.replacer="function"==typeof e.replacer?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Ue(e,t){for(var i,r=n.repeat(" ",t),o=0,a=-1,l="",c=e.length;o<c;)-1===(a=e.indexOf("\\n",o))?(i=e.slice(o),o=c):(i=e.slice(o,a+1),o=a+1),i.length&&"\\n"!==i&&(l+=r),l+=i;return l}function qe(e,t){return"\\n"+n.repeat(" ",e.indent*t)}function Ye(e){return 32===e||9===e}function Re(e){return 32<=e&&e<=126||161<=e&&e<=55295&&8232!==e&&8233!==e||57344<=e&&e<=65533&&e!==Fe||65536<=e&&e<=1114111}function Be(e){return Re(e)&&e!==Fe&&13!==e&&10!==e}function Ke(e,t,n){var i=Be(e),r=i&&!Ye(e);return(n?i:i&&44!==e&&91!==e&&93!==e&&123!==e&&125!==e)&&35!==e&&!(58===t&&!r)||Be(t)&&!Ye(t)&&35===e||58===t&&r}function Pe(e,t){var n,i=e.charCodeAt(t);return i>=55296&&i<=56319&&t+1<e.length&&(n=e.charCodeAt(t+1))>=56320&&n<=57343?1024*(i-55296)+n-56320+65536:i}function We(e){return/^\\n* /.test(e)}function He(e,t,n,i,r,o,a,l){var c,s,u=0,p=null,f=!1,d=!1,h=-1!==i,g=-1,m=Re(s=Pe(e,0))&&s!==Fe&&!Ye(s)&&45!==s&&63!==s&&58!==s&&44!==s&&91!==s&&93!==s&&123!==s&&125!==s&&35!==s&&38!==s&&42!==s&&33!==s&&124!==s&&61!==s&&62!==s&&39!==s&&34!==s&&37!==s&&64!==s&&96!==s&&function(e){return!Ye(e)&&58!==e}(Pe(e,e.length-1));if(t||a)for(c=0;c<e.length;u>=65536?c+=2:c++){if(!Re(u=Pe(e,c)))return 5;m=m&&Ke(u,p,l),p=u}else{for(c=0;c<e.length;u>=65536?c+=2:c++){if(10===(u=Pe(e,c)))f=!0,h&&(d=d||c-g-1>i&&" "!==e[g+1],g=c);else if(!Re(u))return 5;m=m&&Ke(u,p,l),p=u}d=d||h&&c-g-1>i&&" "!==e[g+1]}return f||d?n>9&&We(e)?5:a?2===o?5:2:d?4:3:!m||a||r(e)?2===o?5:2:1}function $e(e,t,n,i,r){e.dump=function(){if(0===t.length)return 2===e.quotingType?'""':"''";if(!e.noCompatMode&&(-1!==Me.indexOf(t)||Le.test(t)))return 2===e.quotingType?'"'+t+'"':"'"+t+"'";var a=e.indent*Math.max(1,n),l=-1===e.lineWidth?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-a),c=i||e.flowLevel>-1&&n>=e.flowLevel;switch(He(t,c,e.indent,l,function(t){return function(e,t){var n,i;for(n=0,i=e.implicitTypes.length;n<i;n+=1)if(e.implicitTypes[n].resolve(t))return!0;return!1}(e,t)},e.quotingType,e.forceQuotes&&!i,r)){case 1:return t;case 2:return"'"+t.replace(/'/g,"''")+"'";case 3:return"|"+Ge(t,e.indent)+Ve(Ue(t,a));case 4:return">"+Ge(t,e.indent)+Ve(Ue(function(e,t){var n,i,r=/(\\n+)([^\\n]*)/g,o=(l=e.indexOf("\\n"),l=-1!==l?l:e.length,r.lastIndex=l,Ze(e.slice(0,l),t)),a="\\n"===e[0]||" "===e[0];var l;for(;i=r.exec(e);){var c=i[1],s=i[2];n=" "===s[0],o+=c+(a||n||""===s?"":"\\n")+Ze(s,t),a=n}return o}(t,l),a));case 5:return'"'+function(e){for(var t,n="",i=0,r=0;r<e.length;i>=65536?r+=2:r++)i=Pe(e,r),!(t=Ee[i])&&Re(i)?(n+=e[r],i>=65536&&(n+=e[r+1])):n+=t||_e(i);return n}(t)+'"';default:throw new o("impossible error: invalid scalar style")}}()}function Ge(e,t){var n=We(e)?String(t):"",i="\\n"===e[e.length-1];return n+(i&&("\\n"===e[e.length-2]||"\\n"===e)?"+":i?"":"-")+"\\n"}function Ve(e){return"\\n"===e[e.length-1]?e.slice(0,-1):e}function Ze(e,t){if(""===e||" "===e[0])return e;for(var n,i,r=/ [^ ]/g,o=0,a=0,l=0,c="";n=r.exec(e);)(l=n.index)-o>t&&(i=a>o?a:l,c+="\\n"+e.slice(o,i),o=i+1),a=l;return c+="\\n",e.length-o>t&&a>o?c+=e.slice(o,a)+"\\n"+e.slice(a+1):c+=e.slice(o),c.slice(1)}function Je(e,t,n,i){var r,o,a,l="",c=e.tag;for(r=0,o=n.length;r<o;r+=1)a=n[r],e.replacer&&(a=e.replacer.call(n,String(r),a)),(ze(e,t+1,a,!0,!0,!1,!0)||void 0===a&&ze(e,t+1,null,!0,!0,!1,!0))&&(i&&""===l||(l+=qe(e,t)),e.dump&&10===e.dump.charCodeAt(0)?l+="-":l+="- ",l+=e.dump);e.tag=c,e.dump=l||"[]"}function Qe(e,t,n){var i,r,a,l,c,s;for(a=0,l=(r=n?e.explicitTypes:e.implicitTypes).length;a<l;a+=1)if(((c=r[a]).instanceOf||c.predicate)&&(!c.instanceOf||"object"==typeof t&&t instanceof c.instanceOf)&&(!c.predicate||c.predicate(t))){if(n?c.multi&&c.representName?e.tag=c.representName(t):e.tag=c.tag:e.tag="?",c.represent){if(s=e.styleMap[c.tag]||c.defaultStyle,"[object Function]"===Te.call(c.represent))i=c.represent(t,s);else{if(!Ne.call(c.represent,s))throw new o("!<"+c.tag+'> tag resolver accepts not "'+s+'" style');i=c.represent[s](t,s)}e.dump=i}return!0}return!1}function ze(e,t,n,i,r,a,l){e.tag=null,e.dump=n,Qe(e,n,!1)||Qe(e,n,!0);var c,s=Te.call(e.dump),u=i;i&&(i=e.flowLevel<0||e.flowLevel>t);var p,f,d="[object Object]"===s||"[object Array]"===s;if(d&&(f=-1!==(p=e.duplicates.indexOf(n))),(null!==e.tag&&"?"!==e.tag||f||2!==e.indent&&t>0)&&(r=!1),f&&e.usedDuplicates[p])e.dump="*ref_"+p;else{if(d&&f&&!e.usedDuplicates[p]&&(e.usedDuplicates[p]=!0),"[object Object]"===s)i&&0!==Object.keys(e.dump).length?(!function(e,t,n,i){var r,a,l,c,s,u,p="",f=e.tag,d=Object.keys(n);if(!0===e.sortKeys)d.sort();else if("function"==typeof e.sortKeys)d.sort(e.sortKeys);else if(e.sortKeys)throw new o("sortKeys must be a boolean or a function");for(r=0,a=d.length;r<a;r+=1)u="",i&&""===p||(u+=qe(e,t)),c=n[l=d[r]],e.replacer&&(c=e.replacer.call(n,l,c)),ze(e,t+1,l,!0,!0,!0)&&((s=null!==e.tag&&"?"!==e.tag||e.dump&&e.dump.length>1024)&&(e.dump&&10===e.dump.charCodeAt(0)?u+="?":u+="? "),u+=e.dump,s&&(u+=qe(e,t)),ze(e,t+1,c,!0,s)&&(e.dump&&10===e.dump.charCodeAt(0)?u+=":":u+=": ",p+=u+=e.dump));e.tag=f,e.dump=p||"{}"}(e,t,e.dump,r),f&&(e.dump="&ref_"+p+e.dump)):(!function(e,t,n){var i,r,o,a,l,c="",s=e.tag,u=Object.keys(n);for(i=0,r=u.length;i<r;i+=1)l="",""!==c&&(l+=", "),e.condenseFlow&&(l+='"'),a=n[o=u[i]],e.replacer&&(a=e.replacer.call(n,o,a)),ze(e,t,o,!1,!1)&&(e.dump.length>1024&&(l+="? "),l+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),ze(e,t,a,!1,!1)&&(c+=l+=e.dump));e.tag=s,e.dump="{"+c+"}"}(e,t,e.dump),f&&(e.dump="&ref_"+p+" "+e.dump));else if("[object Array]"===s)i&&0!==e.dump.length?(e.noArrayIndent&&!l&&t>0?Je(e,t-1,e.dump,r):Je(e,t,e.dump,r),f&&(e.dump="&ref_"+p+e.dump)):(!function(e,t,n){var i,r,o,a="",l=e.tag;for(i=0,r=n.length;i<r;i+=1)o=n[i],e.replacer&&(o=e.replacer.call(n,String(i),o)),(ze(e,t,o,!1,!1)||void 0===o&&ze(e,t,null,!1,!1))&&(""!==a&&(a+=","+(e.condenseFlow?"":" ")),a+=e.dump);e.tag=l,e.dump="["+a+"]"}(e,t,e.dump),f&&(e.dump="&ref_"+p+" "+e.dump));else{if("[object String]"!==s){if("[object Undefined]"===s)return!1;if(e.skipInvalid)return!1;throw new o("unacceptable kind of an object to dump "+s)}"?"!==e.tag&&$e(e,e.dump,t,a,u)}null!==e.tag&&"?"!==e.tag&&(c=encodeURI("!"===e.tag[0]?e.tag.slice(1):e.tag).replace(/!/g,"%21"),c="!"===e.tag[0]?"!"+c:"tag:yaml.org,2002:"===c.slice(0,18)?"!!"+c.slice(18):"!<"+c+">",e.dump=c+" "+e.dump)}return!0}function Xe(e,t){var n,i,r=[],o=[];for(et(e,r,o),n=0,i=o.length;n<i;n+=1)t.duplicates.push(r[o[n]]);t.usedDuplicates=new Array(i)}function et(e,t,n){var i,r,o;if(null!==e&&"object"==typeof e)if(-1!==(r=t.indexOf(e)))-1===n.indexOf(r)&&n.push(r);else if(t.push(e),Array.isArray(e))for(r=0,o=e.length;r<o;r+=1)et(e[r],t,n);else for(r=0,o=(i=Object.keys(e)).length;r<o;r+=1)et(e[i[r]],t,n)}function tt(e,t){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+t+" instead, which is now safe by default.")}}var nt=p,it=h,rt=b,ot=j,at=T,lt=P,ct=je.load,st=je.loadAll,ut={dump:function(e,t){var n=new De(t=t||{});n.noRefs||Xe(e,n);var i=e;return n.replacer&&(i=n.replacer.call({"":i},"",i)),ze(n,0,i,!0,!0)?n.dump+"\\n":""}}.dump,pt=o,ft={binary:_,float:O,map:y,null:A,pairs:R,set:K,timestamp:E,bool:v,int:x,merge:M,omap:q,seq:m,str:g},dt=tt("safeLoad","load"),ht=tt("safeLoadAll","loadAll"),gt=tt("safeDump","dump"),mt={Type:nt,Schema:it,FAILSAFE_SCHEMA:rt,JSON_SCHEMA:ot,CORE_SCHEMA:at,DEFAULT_SCHEMA:lt,load:ct,loadAll:st,dump:ut,YAMLException:pt,types:ft,safeLoad:dt,safeLoadAll:ht,safeDump:gt};e.CORE_SCHEMA=at,e.DEFAULT_SCHEMA=lt,e.FAILSAFE_SCHEMA=rt,e.JSON_SCHEMA=ot,e.Schema=it,e.Type=nt,e.YAMLException=pt,e.default=mt,e.dump=ut,e.load=ct,e.loadAll=st,e.safeDump=gt,e.safeLoad=dt,e.safeLoadAll=ht,e.types=ft,Object.defineProperty(e,"__esModule",{value:!0})});

function parseYaml(text) {
  const value = jsyaml.load(text ?? "");
  if (value == null) {
    return {};
  }
  return value;
}

function serializeYaml(value) {
  return jsyaml.dump(value ?? {}, { lineWidth: -1, noRefs: true });
}

function parseMarkdownFrontmatter(text) {
  const normalized = text.replace(/\\r\\n?/g, "\\n");
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return {};
  }
  return parseYaml(normalized.slice(bounds.contentStart, bounds.contentEnd));
}

function evaluateFilter(filter, row, warnings = []) {
  if (!filter) {
    return true;
  }
  if (typeof filter === "string") {
    return evaluateFilterExpression(filter, row, warnings);
  }
  if (Array.isArray(filter)) {
    return filter.every((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.and) {
    return filter.and.every((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.or) {
    return filter.or.some((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.not) {
    return !filter.not.some((child) => evaluateFilter(child, row, warnings));
  }
  warnings.push(\`Unsupported filter object: \${JSON.stringify(filter)}\`);
  return false;
}

function buildTableModel(baseConfig, files) {
  const warnings = [];
  const view = (baseConfig.views ?? []).find((candidate) => candidate.type === "table");
  if (!view) {
    return { columns: [], rows: [], warnings: ["No table view found in base file."] };
  }

  const combinedFilter = { and: [baseConfig.filters, view.filters].filter(Boolean) };
  const columns = (view.order ?? ["file.name"]).map((property) => ({
    property,
    label: propertyLabel(baseConfig, property),
    editable: isEditableProperty(property),
    width: columnWidth(view, property),
  }));

  const rows = files
    .filter((file) => evaluateFilter(combinedFilter, file, warnings))
    .map((file) => ({
      file,
      values: columns.map((column) => resolveProperty(file, column.property)),
      cells: columns.map((column) => formatValue(resolveProperty(file, column.property))),
    }));

  return { columns, rows, warnings: unique(warnings) };
}

function sortTableRows(rows, columnIndex, direction) {
  if (direction !== "ascending" && direction !== "descending") {
    return [...rows];
  }
  const multiplier = direction === "ascending" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const comparison = compareSortValues(
        sortValueForRow(left.row, columnIndex),
        sortValueForRow(right.row, columnIndex),
      );
      return comparison === 0 ? left.index - right.index : comparison * multiplier;
    })
    .map((item) => item.row);
}

function updateMarkdownFrontmatterValue(markdown, property, textValue) {
  if (!isEditableProperty(property)) {
    throw new Error(\`Cannot edit read-only property: \${property}\`);
  }

  const normalized = markdown.replace(/\\r\\n?/g, "\\n");
  const key = frontmatterKey(property);
  const frontmatter = parseMarkdownFrontmatter(normalized);
  frontmatter[key] = parseEditedValue(textValue, frontmatter[key]);

  const yaml = serializeFlatYaml(frontmatter);
  const nextFrontmatter = \`---\\n\${yaml}\${yaml ? "\\n" : ""}---\\n\`;
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return \`\${nextFrontmatter}\${normalized}\`;
  }
  return \`\${normalized.slice(0, bounds.blockStart)}\${nextFrontmatter}\${normalized.slice(bounds.blockEnd)}\`;
}

function renameMarkdownFrontmatterProperty(markdown, oldProperty, newProperty) {
  if (!isEditableProperty(oldProperty) || !isEditableProperty(newProperty)) {
    throw new Error("Cannot rename read-only file properties.");
  }

  const oldKey = frontmatterKey(oldProperty);
  const newKey = frontmatterKey(newProperty);
  if (!oldKey || !newKey) {
    throw new Error("Property names cannot be empty.");
  }
  if (oldKey === newKey) {
    return markdown;
  }

  const normalized = markdown.replace(/\\r\\n?/g, "\\n");
  const frontmatter = parseMarkdownFrontmatter(normalized);
  if (!Object.hasOwn(frontmatter, oldKey)) {
    return normalized;
  }
  if (Object.hasOwn(frontmatter, newKey)) {
    throw new Error(\`Cannot rename \${oldKey} to \${newKey}; target property already exists.\`);
  }

  const renamed = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    renamed[key === oldKey ? newKey : key] = value;
  }

  const yaml = serializeFlatYaml(renamed);
  const nextFrontmatter = \`---\\n\${yaml}\${yaml ? "\\n" : ""}---\\n\`;
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return \`\${nextFrontmatter}\${normalized}\`;
  }
  return \`\${normalized.slice(0, bounds.blockStart)}\${nextFrontmatter}\${normalized.slice(bounds.blockEnd)}\`;
}

function renameBaseProperty(baseConfig, oldProperty, newProperty) {
  if (!isEditableProperty(oldProperty) || !isEditableProperty(newProperty)) {
    throw new Error("Cannot rename read-only file properties.");
  }

  const normalizedNewProperty = normalizeRenamedProperty(oldProperty, newProperty);
  if (!frontmatterKey(normalizedNewProperty)) {
    throw new Error("Property names cannot be empty.");
  }
  if (oldProperty === normalizedNewProperty) {
    return baseConfig;
  }

  const renamed = renamePropertyReferences(baseConfig, oldProperty, normalizedNewProperty);
  const propertyConfig = renamed.properties?.[frontmatterKey(normalizedNewProperty)];
  if (propertyConfig && typeof propertyConfig === "object" && Object.hasOwn(propertyConfig, "displayName")) {
    propertyConfig.displayName = frontmatterKey(normalizedNewProperty);
  }
  return renamed;
}

function buildNewEntryDraft(baseConfig, basePath, title) {
  const view = (baseConfig.views ?? []).find((candidate) => candidate.type === "table");
  const equalityFilters = collectEqualityFilters({ and: [baseConfig.filters, view?.filters].filter(Boolean) });
  const folder = equalityFilters.find((filter) => filter.property === "file.folder")?.value
    ?? normalizePath(basePath).split("/").slice(0, -1).join("/");
  const frontmatter = {};

  for (const filter of equalityFilters) {
    if (filter.property.startsWith("file.")) {
      continue;
    }
    frontmatter[frontmatterKey(filter.property)] = filter.value;
  }

  const fileName = entryFileName(title);
  const path = normalizePath([folder, fileName].filter(Boolean).join("/"));
  const yaml = serializeFlatYaml(frontmatter);
  const markdown = \`---\\n\${yaml}\${yaml ? "\\n" : ""}---\\n\`;
  return { path, markdown };
}

function makeRowFromFile(meta, markdown) {
  const path = normalizePath(meta.name ?? meta.path ?? "");
  const name = path.split("/").pop() ?? path;
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

  return {
    file: {
      name: name.replace(/\\.[^.]+$/, ""),
      basename: name.replace(/\\.[^.]+$/, ""),
      ext,
      folder,
      path,
      size: meta.size,
      mtime: meta.modified ?? meta.lastModified,
      ctime: meta.created,
    },
    note: parseMarkdownFrontmatter(markdown),
  };
}

function entryFileName(title) {
  const normalized = String(title ?? "")
    .trim()
    .replace(/\\.md$/i, "")
    .replace(/[\\\\/]/g, "-")
    .replace(/[\\u0000-\\u001f]/g, "")
    .replace(/\\s+/g, " ");
  return \`\${normalized || "Untitled"}.md\`;
}

function renamedPagePath(currentPath, title) {
  const normalizedPath = normalizePath(currentPath);
  const folder = normalizedPath.includes("/") ? normalizedPath.slice(0, normalizedPath.lastIndexOf("/")) : "";
  return normalizePath([folder, entryFileName(title)].filter(Boolean).join("/"));
}

function buildBaseSearchContent(path, yamlText) {
  const baseName = normalizePath(path).split("/").pop()?.replace(/\\.base$/i, "") ?? "";
  const parts = ["Obsidian Base", baseName];

  try {
    const baseConfig = parseYaml(yamlText);
    collectSearchableYamlValues(baseConfig, parts);
  } catch {
    // Keep malformed base files searchable by their raw source.
  }

  parts.push(yamlText);
  return unique(parts.flatMap(splitSearchContentLine))
    .filter(Boolean)
    .join("\\n");
}

function parseScalar(text) {
  if (text === "" || text === "~" || text === "null") {
    return null;
  }
  if (text === "[]") {
    return [];
  }
  if (text === "true") {
    return true;
  }
  if (text === "false") {
    return false;
  }
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  if (/^-?\\d+(\\.\\d+)?$/.test(text)) {
    return Number(text);
  }
  return text;
}

function findFrontmatterBounds(text) {
  if (!text.startsWith("---\\n")) {
    return null;
  }
  const contentStart = 4;
  const closingStart = text.indexOf("\\n---", contentStart);
  if (closingStart === -1) {
    return null;
  }
  const closingLineEnd = text.indexOf("\\n", closingStart + 1);
  return {
    blockStart: 0,
    contentStart,
    contentEnd: closingStart,
    blockEnd: closingLineEnd === -1 ? text.length : closingLineEnd + 1,
  };
}

function isEditableProperty(property) {
  return !property.startsWith("file.");
}

function frontmatterKey(property) {
  return property.startsWith("note.") ? property.slice(5) : property;
}

function parseEditedValue(textValue, previousValue) {
  const text = String(textValue ?? "").trim();
  if (Array.isArray(previousValue)) {
    return text === "" ? [] : text.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (typeof previousValue === "number" && /^-?\\d+(\\.\\d+)?$/.test(text)) {
    return Number(text);
  }
  if (typeof previousValue === "boolean") {
    return text === "true";
  }
  return String(textValue ?? "");
}

function normalizeRenamedProperty(oldProperty, newProperty) {
  const text = String(newProperty ?? "").trim();
  if (oldProperty.startsWith("note.") && !text.startsWith("note.") && !text.startsWith("file.")) {
    return \`note.\${text}\`;
  }
  return text;
}

function renamePropertyReferences(value, oldProperty, newProperty) {
  if (Array.isArray(value)) {
    return value.map((item) => renamePropertyReferences(item, oldProperty, newProperty));
  }
  if (value == null || typeof value !== "object") {
    return renamePropertyExpression(value, oldProperty, newProperty);
  }

  const renamed = {};
  for (const [key, item] of Object.entries(value)) {
    const nextKey = renamePropertyReferenceKey(key, oldProperty, newProperty);
    if (Object.hasOwn(renamed, nextKey)) {
      throw new Error(\`Cannot rename \${key} to \${nextKey}; target property already exists.\`);
    }
    renamed[nextKey] = renamePropertyReferences(item, oldProperty, newProperty);
  }
  return renamed;
}

function renamePropertyReferenceKey(key, oldProperty, newProperty) {
  if (key === oldProperty) {
    return newProperty;
  }
  const oldKey = frontmatterKey(oldProperty);
  const newKey = frontmatterKey(newProperty);
  if (key === oldKey) {
    return newKey;
  }
  if (key === \`note.\${oldKey}\`) {
    return \`note.\${newKey}\`;
  }
  return key;
}

function renamePropertyExpression(value, oldProperty, newProperty) {
  if (typeof value !== "string") {
    return value;
  }
  const operatorMatch = value.match(/^(.+?)(\\s*(?:==|!=|>=|<=|>|<)\\s*.+)$/);
  if (!operatorMatch) {
    return renamePropertyReferenceKey(value, oldProperty, newProperty);
  }
  const left = operatorMatch[1].trim();
  const nextLeft = renamePropertyReferenceKey(left, oldProperty, newProperty);
  if (left === nextLeft) {
    return value;
  }
  return nextLeft + operatorMatch[2];
}

function serializeFlatYaml(value) {
  if (Object.keys(value).length === 0) {
    return "";
  }
  return jsyaml.dump(value, { lineWidth: -1, noRefs: true }).replace(/\\n+$/, "");
}

function evaluateFilterExpression(expression, row, warnings) {
  const tagMatch = expression.match(/^file\\.hasTag\\((.+)\\)$/);
  if (tagMatch) {
    return fileHasTag(row, parseScalar(tagMatch[1].trim()));
  }

  const inFolderMatch = expression.match(/^file\\.inFolder\\((.+)\\)$/);
  if (inFolderMatch) {
    return fileInFolder(row, parseScalar(inFolderMatch[1].trim()));
  }

  const match = expression.match(/^(.+?)\\s*(==|!=|>=|<=|>|<)\\s*(.+)$/);
  if (!match) {
    warnings.push(\`Unsupported filter expression: \${expression}\`);
    return false;
  }
  const [, leftExpression, operator, rightExpression] = match;
  const left = resolveProperty(row, leftExpression.trim());
  const right = parseScalar(rightExpression.trim());

  switch (operator) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      warnings.push(\`Unsupported filter operator: \${operator}\`);
      return false;
  }
}

function fileHasTag(row, tag) {
  if (typeof tag !== "string" || tag === "") {
    return false;
  }
  const tags = row.note?.tags;
  if (Array.isArray(tags)) {
    return tags.includes(tag);
  }
  return tags === tag;
}

function fileInFolder(row, folder) {
  if (typeof folder !== "string") {
    return false;
  }
  const expectedFolder = normalizePath(folder.trim()).replace(/\\/+$/, "");
  const actualFolder = normalizePath(row.file?.folder ?? "").replace(/\\/+$/, "");
  if (expectedFolder === "") {
    return actualFolder === "";
  }
  return actualFolder === expectedFolder || actualFolder.startsWith(\`\${expectedFolder}/\`);
}

function collectEqualityFilters(filter) {
  if (!filter) {
    return [];
  }
  if (typeof filter === "string") {
    const match = filter.match(/^(.+?)\\s*==\\s*(.+)$/);
    if (!match) {
      return [];
    }
    return [{ property: match[1].trim(), value: parseScalar(match[2].trim()) }];
  }
  if (Array.isArray(filter)) {
    return filter.flatMap(collectEqualityFilters);
  }
  if (filter.and) {
    return filter.and.flatMap(collectEqualityFilters);
  }
  return [];
}

function resolveProperty(row, property) {
  if (property.startsWith("file.")) {
    return row.file?.[property.slice(5)];
  }
  if (property.startsWith("note.")) {
    return row.note?.[property.slice(5)];
  }
  return row.note?.[property];
}

function propertyLabel(baseConfig, property) {
  const configured = baseConfig.properties?.[property]?.displayName;
  if (configured) {
    return configured;
  }
  if (property === "file.name") {
    return "Name";
  }
  if (property.startsWith("file.")) {
    return property.slice(5);
  }
  if (property.startsWith("note.")) {
    return property.slice(5);
  }
  return property;
}

function columnWidth(view, property) {
  const columnSize = view.columnSize ?? {};
  for (const key of columnSizeKeys(property)) {
    const width = Number(columnSize[key]);
    if (Number.isFinite(width) && width > 0) {
      return width;
    }
  }
  return null;
}

function columnSizeKeys(property) {
  if (property.startsWith("file.") || property.startsWith("note.")) {
    return [property];
  }
  return [property, \`note.\${property}\`];
}

function formatValue(value) {
  if (value == null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && item !== "").join(", ");
  }
  return String(value);
}

function sortValueForRow(row, columnIndex) {
  if (Array.isArray(row.values)) {
    return row.values[columnIndex];
  }
  return row.cells?.[columnIndex];
}

function compareSortValues(left, right) {
  const leftMissing = left == null || left === "";
  const rightMissing = right == null || right === "";
  if (leftMissing || rightMissing) {
    return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1;
  }

  if (Array.isArray(left)) {
    left = left.filter((item) => item != null && item !== "").join(", ");
  }
  if (Array.isArray(right)) {
    right = right.filter((item) => item != null && item !== "").join(", ");
  }

  const leftNumber = sortableNumber(left);
  const rightNumber = sortableNumber(right);
  if (leftNumber != null && rightNumber != null) {
    return leftNumber === rightNumber ? 0 : leftNumber < rightNumber ? -1 : 1;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sortableNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^-?\\d+(\\.\\d+)?$/.test(value.trim())) {
    return Number(value);
  }
  return null;
}

function normalizePath(path) {
  return path.replace(/^\\/+/, "").replace(/\\\\/g, "/");
}

function unique(values) {
  return [...new Set(values)];
}

function collectSearchableYamlValues(value, parts) {
  if (value == null) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSearchableYamlValues(item, parts);
    }
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      parts.push(key);
      collectSearchableYamlValues(item, parts);
    }
    return;
  }
  parts.push(String(value));
}

function splitSearchContentLine(value) {
  return String(value)
    .split(/\\r?\\n/)
    .map((line) => line.trim());
}


const decoder = new TextDecoder();
const encoder = new TextEncoder();
const DEFAULT_COLUMN_WIDTH = 180;
const MIN_COLUMN_WIDTH = 80;
const MAX_COLUMN_WIDTH = 900;
let currentBaseConfig = null;
let currentBaseName = "Base";
let currentBasePath = "";
let activeColumnResize = null;
let currentSort = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

async function syscall(name, ...args) {
  if (!window.silverbullet?.syscall) {
    throw new Error("SilverBullet document editor syscall bridge is unavailable.");
  }
  return await window.silverbullet.syscall(name, ...args);
}

async function readFileText(name) {
  const data = await syscall("space.readFile", name);
  if (typeof data === "string") {
    return data;
  }
  return decoder.decode(data);
}

async function writeFileText(name, text) {
  await syscall("space.writeFile", name, encoder.encode(text));
}

async function deleteFile(name) {
  await syscall("space.deleteFile", name);
}

async function fileExists(name) {
  return await syscall("space.fileExists", name);
}

async function loadMarkdownRows() {
  const files = await syscall("space.listFiles");
  const markdownFiles = files.filter((file) => {
    const name = file.name ?? file.path ?? "";
    return name.endsWith(".md");
  });

  const rows = [];
  for (const file of markdownFiles) {
    const name = file.name ?? file.path;
    try {
      rows.push(makeRowFromFile(file, await readFileText(name)));
    } catch (error) {
      console.warn("Failed to read markdown file", name, error);
    }
  }
  return rows;
}

function renderModel(model, baseName) {
  const displayModel = applyCurrentSort(model);
  const warningHtml = model.warnings.length
    ? '<div class="warnings">' + model.warnings.map(escapeHtml).join("<br>") + "</div>"
    : "";
  const currentWidths = readCurrentColumnWidthsByProperty();
  const storedWidths = readStoredColumnWidths(baseName);
  const columnWidths = displayModel.columns.map((column) => {
    return clampColumnWidth(currentWidths[column.property] ?? storedWidths[column.property] ?? column.width ?? DEFAULT_COLUMN_WIDTH);
  });
  const hasCurrentWidths = displayModel.columns.every((column) => currentWidths[column.property] != null);
  const colgroupHtml = columnWidths.map((width, columnIndex) => {
    return '<col data-column-index="' + columnIndex + '" style="width: ' + width + 'px">';
  }).join("");
  const headerHtml = displayModel.columns.map((column, columnIndex) => {
    const label = escapeHtml(column.label);
    const direction = currentSort?.property === column.property ? currentSort.direction : null;
    const sortText = direction === "ascending" ? " &uarr;" : direction === "descending" ? " &darr;" : "";
    const ariaSort = direction ?? "none";
    return '<th data-column-index="' + columnIndex + '" aria-sort="' + ariaSort + '">' +
      '<div class="column-header" title="Sort by ' + label + '">' +
      '<span class="column-label" contenteditable="' + (column.editable ? "true" : "false") + '" spellcheck="false" data-column-index="' + columnIndex +
      '" title="' + (column.editable ? "Rename property" : "Read-only property") + '">' + label + '</span>' +
      '<span class="sort-indicator" aria-hidden="true">' + sortText + '</span>' +
      '<button class="column-resizer" type="button" data-column-index="' + columnIndex +
      '" aria-label="Resize ' + label + ' column" title="Resize column"></button></div></th>';
  }).join("");
  const rowHtml = displayModel.rows.map((row, rowIndex) => (
    '<tr>' + row.cells.map((cell, columnIndex) => {
      const column = displayModel.columns[columnIndex];
      if (column.property === "file.name") {
        return '<td><a class="page-link" href="#" data-page-path="' + escapeHtml(row.file.file.path) +
          '">' + escapeHtml(cell) + '</a></td>';
      }
      if (!column.editable) {
        return '<td>' + escapeHtml(cell) + '</td>';
      }
      if (isPageTitleProperty(column.property)) {
        return '<td contenteditable="true" spellcheck="false" data-row-index="' + rowIndex +
          '" data-column-index="' + columnIndex + '"><a class="page-link" href="#" data-page-path="' +
          escapeHtml(row.file.file.path) + '">' + escapeHtml(cell) + '</a></td>';
      }
      return '<td contenteditable="true" spellcheck="false" data-row-index="' + rowIndex +
        '" data-column-index="' + columnIndex + '">' + escapeHtml(cell) + '</td>';
    }).join("") + '</tr>'
  )).join("");

  document.body.innerHTML = '<main>' +
    '<header><h1>' + escapeHtml(baseName) + '</h1><div class="header-actions">' +
    '<button id="add-entry" type="button">Add entry</button><span id="status">' + model.rows.length +
    ' rows</span></div></header>' +
    warningHtml +
    '<div class="table-wrap"><table style="--table-width: ' + sum(columnWidths) + 'px"><colgroup>' +
    colgroupHtml + '</colgroup><thead><tr>' + headerHtml + '</tr></thead><tbody>' + rowHtml + '</tbody></table></div>' +
    '</main>';
  window.currentModel = displayModel;
  window.baseModel = model;
  if (!hasCurrentWidths) {
    fitTableToContainer(columnWidths);
  } else {
    updateTableWidth();
  }
  document.getElementById("add-entry")?.addEventListener("click", addEntry);
  document.querySelector("tbody")?.addEventListener("focusin", rememberCellValue);
  document.querySelector("tbody")?.addEventListener("focusout", saveEditedCell);
  document.querySelector("tbody")?.addEventListener("keydown", handleCellKeydown);
  document.querySelector("tbody")?.addEventListener("click", openLinkedPage);
  document.querySelector("thead")?.addEventListener("pointerdown", beginColumnResize);
  document.querySelector("thead")?.addEventListener("keydown", handleColumnResizeKeydown);
  document.querySelector("thead")?.addEventListener("focusin", rememberColumnTitle);
  document.querySelector("thead")?.addEventListener("focusout", saveEditedColumnTitle);
  document.querySelector("thead")?.addEventListener("keydown", handleColumnTitleKeydown);
  document.querySelector("thead")?.addEventListener("click", changeColumnSort);
}

function applyCurrentSort(model) {
  if (!currentSort) {
    return model;
  }
  const columnIndex = model.columns.findIndex((column) => column.property === currentSort.property);
  if (columnIndex === -1) {
    currentSort = null;
    return model;
  }
  return {
    ...model,
    rows: sortTableRows(model.rows, columnIndex, currentSort.direction),
  };
}

function changeColumnSort(event) {
  if (event.target.closest?.(".column-label, .column-resizer")) {
    return;
  }
  const headerCell = event.target.closest?.("th[data-column-index]");
  if (!headerCell) {
    return;
  }
  const model = window.baseModel;
  const column = model?.columns[Number(headerCell.dataset.columnIndex)];
  if (!column) {
    return;
  }

  if (currentSort?.property !== column.property) {
    currentSort = { property: column.property, direction: "ascending" };
  } else if (currentSort.direction === "ascending") {
    currentSort = { property: column.property, direction: "descending" };
  } else {
    currentSort = null;
  }
  renderModel(model, currentBaseName);
}

function rememberColumnTitle(event) {
  const title = event.target.closest?.(".column-label[contenteditable='true']");
  if (title) {
    title.dataset.originalValue = title.textContent;
  }
}

function handleColumnTitleKeydown(event) {
  const title = event.target.closest?.(".column-label[contenteditable='true']");
  if (!title) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    title.blur();
  } else if (event.key === "Escape") {
    event.preventDefault();
    title.textContent = title.dataset.originalValue ?? "";
    title.blur();
  }
}

async function saveEditedColumnTitle(event) {
  const title = event.target.closest?.(".column-label[contenteditable='true']");
  if (!title) {
    return;
  }
  const originalLabel = title.dataset.originalValue ?? "";
  const nextProperty = title.textContent.trim();
  if (nextProperty === originalLabel) {
    return;
  }
  if (!nextProperty) {
    title.textContent = originalLabel;
    return;
  }

  const model = window.baseModel;
  const column = model?.columns[Number(title.dataset.columnIndex)];
  if (!column || !currentBaseConfig || !currentBasePath) {
    title.textContent = originalLabel;
    return;
  }

  try {
    setStatus("Renaming...");
    const paths = [...new Set(model.rows.map((row) => row.file.file.path))];
    const markdownUpdates = [];
    for (const path of paths) {
      const markdown = await readFileText(path);
      markdownUpdates.push({
        path,
        markdown: renameMarkdownFrontmatterProperty(markdown, column.property, nextProperty),
      });
    }
    const nextBaseConfig = renameBaseProperty(currentBaseConfig, column.property, nextProperty);
    await writeFileText(currentBasePath, serializeYaml(nextBaseConfig));
    for (const update of markdownUpdates) {
      await writeFileText(update.path, update.markdown);
    }
    currentBaseConfig = nextBaseConfig;
    currentSort = null;
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(currentBaseConfig, rows), currentBaseName);
  } catch (error) {
    title.textContent = originalLabel;
    setStatus("Rename failed");
    console.error(error);
  }
}

async function addEntry() {
  if (!currentBaseConfig) {
    return;
  }

  const title = window.prompt("Entry name");
  if (title == null) {
    return;
  }

  try {
    setStatus("Adding...");
    const draft = await uniqueEntryDraft(currentBaseConfig, currentBasePath, title);
    await writeFileText(draft.path, draft.markdown);
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(currentBaseConfig, rows), currentBaseName);
  } catch (error) {
    setStatus("Add failed");
    console.error(error);
  }
}

async function uniqueEntryDraft(baseConfig, basePath, title) {
  const draft = buildNewEntryDraft(baseConfig, basePath, title);
  if (!await fileExists(draft.path)) {
    return draft;
  }

  const stem = draft.path.toLowerCase().endsWith(".md") ? draft.path.slice(0, -3) : draft.path;
  for (let index = 2; index < 1000; index++) {
    const path = stem + " (" + index + ").md";
    if (!await fileExists(path)) {
      return { ...draft, path };
    }
  }
  throw new Error("Could not find an available entry name.");
}

async function openLinkedPage(event) {
  const link = event.target.closest?.(".page-link");
  if (!link) {
    return;
  }
  event.preventDefault();
  try {
    await syscall("editor.navigate", { path: link.dataset.pagePath });
  } catch (error) {
    setStatus("Open failed");
    console.error(error);
  }
}

function beginColumnResize(event) {
  const handle = event.target.closest?.(".column-resizer");
  if (!handle) {
    return;
  }

  const columnIndex = Number(handle.dataset.columnIndex);
  const column = document.querySelector('col[data-column-index="' + columnIndex + '"]');
  const headerCell = handle.closest("th");
  if (!column || !headerCell) {
    return;
  }
  const headerBounds = headerCell.getBoundingClientRect();

  event.preventDefault();
  handle.classList.add("active");
  document.body.classList.add("resizing-column");
  activeColumnResize = {
    columnIndex,
    handle,
    pointerId: event.pointerId,
    startRight: headerBounds.right,
    startWidth: column.getBoundingClientRect().width,
  };
  handle.setPointerCapture?.(event.pointerId);
  window.addEventListener("pointermove", updateColumnResize);
  window.addEventListener("pointerup", finishColumnResize, { once: true });
  window.addEventListener("pointercancel", finishColumnResize, { once: true });
}

function updateColumnResize(event) {
  if (!activeColumnResize) {
    return;
  }
  setColumnWidth(
    activeColumnResize.columnIndex,
    activeColumnResize.startWidth + event.clientX - activeColumnResize.startRight,
  );
}

function finishColumnResize() {
  if (!activeColumnResize) {
    return;
  }
  persistColumnWidths();
  activeColumnResize.handle.classList.remove("active");
  activeColumnResize.handle.releasePointerCapture?.(activeColumnResize.pointerId);
  document.body.classList.remove("resizing-column");
  window.removeEventListener("pointermove", updateColumnResize);
  window.removeEventListener("pointerup", finishColumnResize);
  window.removeEventListener("pointercancel", finishColumnResize);
  activeColumnResize = null;
}

function handleColumnResizeKeydown(event) {
  const handle = event.target.closest?.(".column-resizer");
  if (!handle || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
    return;
  }
  event.preventDefault();
  const columnIndex = Number(handle.dataset.columnIndex);
  const currentWidth = currentColumnWidths()[columnIndex] ?? DEFAULT_COLUMN_WIDTH;
  setColumnWidth(columnIndex, currentWidth + (event.key === "ArrowRight" ? 16 : -16));
  persistColumnWidths();
}

function setColumnWidth(columnIndex, width) {
  const nextWidth = clampColumnWidth(width);
  const column = document.querySelector('col[data-column-index="' + columnIndex + '"]');
  if (!column) {
    return;
  }
  column.style.width = nextWidth + "px";
  if (window.currentModel?.columns[columnIndex]) {
    window.currentModel.columns[columnIndex].width = nextWidth;
  }
  updateTableWidth();
}

function fitTableToContainer(columnWidths) {
  const tableWrap = document.querySelector(".table-wrap");
  const columns = [...document.querySelectorAll("col[data-column-index]")];
  if (!tableWrap || columns.length === 0) {
    return;
  }

  const availableWidth = Math.floor(tableWrap.clientWidth);
  const currentWidth = sum(columnWidths);
  if (availableWidth <= currentWidth) {
    updateTableWidth();
    return;
  }

  const extraWidth = availableWidth - currentWidth;
  const extraPerColumn = Math.floor(extraWidth / columns.length);
  let remainder = extraWidth - extraPerColumn * columns.length;
  columns.forEach((column, columnIndex) => {
    const width = columnWidths[columnIndex] + extraPerColumn + (remainder > 0 ? 1 : 0);
    remainder -= 1;
    column.style.width = width + "px";
    if (window.currentModel?.columns[columnIndex]) {
      window.currentModel.columns[columnIndex].width = width;
    }
  });
  updateTableWidth();
}

function updateTableWidth() {
  const table = document.querySelector("table");
  if (table) {
    table.style.setProperty("--table-width", sum(currentColumnWidths()) + "px");
  }
}

function currentColumnWidths() {
  return [...document.querySelectorAll("col[data-column-index]")].map((column) => {
    return clampColumnWidth(parseFloat(column.style.width) || column.getBoundingClientRect().width);
  });
}

function readCurrentColumnWidthsByProperty() {
  const widths = {};
  currentColumnWidths().forEach((width, columnIndex) => {
    const property = window.currentModel?.columns[columnIndex]?.property;
    if (property) {
      widths[property] = width;
    }
  });
  return widths;
}

function persistColumnWidths() {
  const widths = {};
  currentColumnWidths().forEach((width, columnIndex) => {
    const property = window.currentModel?.columns[columnIndex]?.property;
    if (property) {
      widths[property] = width;
    }
  });
  try {
    window.localStorage?.setItem(columnWidthsStorageKey(currentBaseName), JSON.stringify(widths));
  } catch (error) {
    console.warn("Failed to store column widths", error);
  }
}

function readStoredColumnWidths(baseName) {
  try {
    return JSON.parse(window.localStorage?.getItem(columnWidthsStorageKey(baseName)) ?? "{}");
  } catch {
    return {};
  }
}

function columnWidthsStorageKey(baseName) {
  return "silverbullet.obsidianBases.columnWidths." + baseName;
}

function clampColumnWidth(width) {
  const number = Number(width);
  if (!Number.isFinite(number)) {
    return DEFAULT_COLUMN_WIDTH;
  }
  return Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, Math.round(number)));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function rememberCellValue(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (cell) {
    cell.dataset.originalValue = cell.textContent;
  }
}

function handleCellKeydown(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (!cell) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    cell.blur();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cell.textContent = cell.dataset.originalValue ?? "";
    cell.blur();
  }
}

async function saveEditedCell(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (!cell || cell.textContent === (cell.dataset.originalValue ?? "")) {
    return;
  }

  const row = window.currentModel?.rows[Number(cell.dataset.rowIndex)];
  const column = window.currentModel?.columns[Number(cell.dataset.columnIndex)];
  if (!row || !column) {
    return;
  }

  const path = row.file.file.path;
  try {
    setStatus("Saving...");
    const markdown = await readFileText(path);
    const updatedMarkdown = updateMarkdownFrontmatterValue(markdown, column.property, cell.textContent);
    const nextPath = isPageTitleProperty(column.property) ? renamedPagePath(path, cell.textContent) : path;
    if (nextPath !== path) {
      if (await fileExists(nextPath)) {
        throw new Error("A page with that filename already exists.");
      }
      await writeFileText(nextPath, updatedMarkdown);
      await deleteFile(path);
    } else {
      await writeFileText(path, updatedMarkdown);
    }
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(currentBaseConfig, rows), currentBaseName);
  } catch (error) {
    cell.textContent = cell.dataset.originalValue ?? "";
    setStatus("Save failed");
    console.error(error);
  }
}

function isPageTitleProperty(property) {
  return property === "title" || property === "note.title";
}

function setStatus(text) {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = text;
  }
}

async function openBase(event) {
  try {
    const detail = event.detail ?? event;
    const meta = detail.meta ?? {};
    const data = detail.data;
    const yamlText = typeof data === "string" ? data : decoder.decode(data);
    const baseConfig = parseYaml(yamlText);
    currentBaseConfig = baseConfig;
    currentBaseName = meta.name ?? "Base";
    currentBasePath = meta.name ?? meta.path ?? "";
    currentSort = null;
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(baseConfig, rows), currentBaseName);
  } catch (error) {
    document.body.innerHTML = '<main><div class="error">' + escapeHtml(error.message ?? error) + '</div></main>';
    console.error(error);
  }
}

window.silverbullet?.addEventListener?.("file-open", openBase);
`;async function me(){return{html:`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.4;
    }
    body {
      margin: 0;
      color: CanvasText;
      background: Canvas;
    }
    main {
      padding: 18px;
    }
    header {
      align-items: baseline;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 20px;
      font-weight: 650;
      margin: 0;
    }
    header span {
      color: color-mix(in srgb, CanvasText 58%, Canvas);
      font-size: 13px;
      white-space: nowrap;
    }
    .header-actions {
      align-items: center;
      display: flex;
      gap: 10px;
    }
    button {
      background: light-dark(#f8fafc, #172033);
      border: 1px solid color-mix(in srgb, CanvasText 24%, Canvas);
      border-radius: 5px;
      color: CanvasText;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      line-height: 1.2;
      padding: 5px 9px;
    }
    button:hover,
    button:focus-visible {
      border-color: light-dark(#2563eb, #7dd3fc);
      outline: 0;
    }
    .table-wrap {
      border: 1px solid color-mix(in srgb, CanvasText 18%, Canvas);
      border-radius: 6px;
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      font-size: 14px;
      table-layout: fixed;
      width: var(--table-width, 100%);
    }
    th,
    td {
      border-bottom: 1px solid color-mix(in srgb, CanvasText 14%, Canvas);
      overflow: hidden;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    th {
      background: color-mix(in srgb, CanvasText 6%, Canvas);
      font-weight: 620;
      position: sticky;
      top: 0;
      user-select: none;
    }
    .column-header {
      align-items: center;
      cursor: pointer;
      display: flex;
      gap: 8px;
      min-height: 20px;
    }
    .column-label {
      display: inline-block;
      flex: 0 1 auto;
      min-width: 0;
      outline: 0;
      max-width: 100%;
    }
    .column-label[contenteditable="true"] {
      cursor: text;
    }
    .column-label[contenteditable="true"]:hover,
    .column-label[contenteditable="true"]:focus {
      color: inherit;
      background: light-dark(#eef6ff, #102a43);
      box-shadow: 0 0 0 2px light-dark(#2563eb, #7dd3fc);
    }
    .sort-indicator {
      flex: 0 0 auto;
      font-size: 12px;
      line-height: 1;
      min-width: 10px;
    }
    .column-resizer {
      background: transparent;
      border: 0;
      border-radius: 3px;
      bottom: 0;
      color: inherit;
      cursor: col-resize;
      position: absolute;
      right: 0;
      top: 0;
      width: 8px;
      padding: 0;
      touch-action: none;
      z-index: 2;
    }
    .column-resizer::after {
      background: color-mix(in srgb, CanvasText 24%, Canvas);
      bottom: 3px;
      content: "";
      position: absolute;
      right: 0;
      top: 3px;
      width: 1px;
    }
    .column-resizer:hover::after,
    .column-resizer:focus-visible::after,
    body.resizing-column .column-resizer.active::after {
      background: light-dark(#2563eb, #7dd3fc);
      width: 2px;
    }
    tr:last-child td {
      border-bottom: 0;
    }
    td[contenteditable="true"] {
      cursor: text;
      outline: 0;
    }
    td[contenteditable="true"]:focus {
      background: light-dark(#eef6ff, #102a43);
      box-shadow: inset 0 0 0 2px light-dark(#2563eb, #7dd3fc);
    }
    .page-link {
      color: light-dark(#1d4ed8, #93c5fd);
      cursor: pointer;
      text-decoration: none;
    }
    .page-link:hover,
    .page-link:focus-visible {
      text-decoration: underline;
    }
    .warnings,
    .error {
      border-radius: 6px;
      margin-bottom: 12px;
      padding: 10px 12px;
    }
    .warnings {
      background: light-dark(#fff7d6, #3b300c);
      color: light-dark(#5b4500, #ffe08a);
    }
    .error {
      background: light-dark(#ffe3e3, #4a1515);
      color: light-dark(#7f1d1d, #fecaca);
    }
  </style>
</head>
<body>
  <main>Loading base...</main>
  <script>${he}<\/script>
</body>
</html>`}}function Ne(e){return typeof e>"u"||e===null}function hn(e){return typeof e=="object"&&e!==null}function mn(e){return Array.isArray(e)?e:Ne(e)?[]:[e]}function gn(e,n){var t,i,r,l;if(n)for(l=Object.keys(n),t=0,i=l.length;t<i;t+=1)r=l[t],e[r]=n[r];return e}function yn(e,n){var t="",i;for(i=0;i<n;i+=1)t+=e;return t}function xn(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var wn=Ne,bn=hn,vn=mn,An=yn,Cn=xn,Sn=gn,b={isNothing:wn,isObject:bn,toArray:vn,repeat:An,isNegativeZero:Cn,extend:Sn};function _e(e,n){var t="",i=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(t+='in "'+e.mark.name+'" '),t+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!n&&e.mark.snippet&&(t+=`

`+e.mark.snippet),i+" "+t):i}function B(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=_e(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}B.prototype=Object.create(Error.prototype);B.prototype.constructor=B;B.prototype.toString=function(n){return this.name+": "+_e(this,n)};var C=B;function X(e,n,t,i,r){var l="",o="",a=Math.floor(r/2)-1;return i-n>a&&(l=" ... ",n=i-a+l.length),t-i>a&&(o=" ...",t=i+a-o.length),{str:l+e.slice(n,t).replace(/\t/g,"\u2192")+o,pos:i-n+l.length}}function J(e,n){return b.repeat(" ",n-e.length)+e}function kn(e,n){if(n=Object.create(n||null),!e.buffer)return null;n.maxLength||(n.maxLength=79),typeof n.indent!="number"&&(n.indent=1),typeof n.linesBefore!="number"&&(n.linesBefore=3),typeof n.linesAfter!="number"&&(n.linesAfter=2);for(var t=/\r?\n|\r|\0/g,i=[0],r=[],l,o=-1;l=t.exec(e.buffer);)r.push(l.index),i.push(l.index+l[0].length),e.position<=l.index&&o<0&&(o=i.length-2);o<0&&(o=i.length-1);var a="",u,c,f=Math.min(e.line+n.linesAfter,r.length).toString().length,s=n.maxLength-(n.indent+f+3);for(u=1;u<=n.linesBefore&&!(o-u<0);u++)c=X(e.buffer,i[o-u],r[o-u],e.position-(i[o]-i[o-u]),s),a=b.repeat(" ",n.indent)+J((e.line-u+1).toString(),f)+" | "+c.str+`
`+a;for(c=X(e.buffer,i[o],r[o],e.position,s),a+=b.repeat(" ",n.indent)+J((e.line+1).toString(),f)+" | "+c.str+`
`,a+=b.repeat("-",n.indent+f+3+c.pos)+`^
`,u=1;u<=n.linesAfter&&!(o+u>=r.length);u++)c=X(e.buffer,i[o+u],r[o+u],e.position-(i[o]-i[o+u]),s),a+=b.repeat(" ",n.indent)+J((e.line+u+1).toString(),f)+" | "+c.str+`
`;return a.replace(/\n$/,"")}var En=kn,Fn=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],Tn=["scalar","sequence","mapping"];function In(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(i){n[String(i)]=t})}),n}function On(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(Fn.indexOf(t)===-1)throw new C('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.options=n,this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.representName=n.representName||null,this.defaultStyle=n.defaultStyle||null,this.multi=n.multi||!1,this.styleAliases=In(n.styleAliases||null),Tn.indexOf(this.kind)===-1)throw new C('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var v=On;function ge(e,n){var t=[];return e[n].forEach(function(i){var r=t.length;t.forEach(function(l,o){l.tag===i.tag&&l.kind===i.kind&&l.multi===i.multi&&(r=o)}),t[r]=i}),t}function Nn(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},n,t;function i(r){r.multi?(e.multi[r.kind].push(r),e.multi.fallback.push(r)):e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(i);return e}function ee(e){return this.extend(e)}ee.prototype.extend=function(n){var t=[],i=[];if(n instanceof v)i.push(n);else if(Array.isArray(n))i=i.concat(n);else if(n&&(Array.isArray(n.implicit)||Array.isArray(n.explicit)))n.implicit&&(t=t.concat(n.implicit)),n.explicit&&(i=i.concat(n.explicit));else throw new C("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");t.forEach(function(l){if(!(l instanceof v))throw new C("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(l.loadKind&&l.loadKind!=="scalar")throw new C("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(l.multi)throw new C("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),i.forEach(function(l){if(!(l instanceof v))throw new C("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var r=Object.create(ee.prototype);return r.implicit=(this.implicit||[]).concat(t),r.explicit=(this.explicit||[]).concat(i),r.compiledImplicit=ge(r,"implicit"),r.compiledExplicit=ge(r,"explicit"),r.compiledTypeMap=Nn(r.compiledImplicit,r.compiledExplicit),r};var _n=ee,Ln=new v("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Mn=new v("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Pn=new v("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),jn=new _n({explicit:[Ln,Mn,Pn]});function Rn(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Bn(){return null}function Wn(e){return e===null}var Dn=new v("tag:yaml.org,2002:null",{kind:"scalar",resolve:Rn,construct:Bn,predicate:Wn,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function zn(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function $n(e){return e==="true"||e==="True"||e==="TRUE"}function Yn(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Kn=new v("tag:yaml.org,2002:bool",{kind:"scalar",resolve:zn,construct:$n,predicate:Yn,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function Un(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Hn(e){return 48<=e&&e<=55}function qn(e){return 48<=e&&e<=57}function Vn(e){if(e===null)return!1;var n=e.length,t=0,i=!1,r;if(!n)return!1;if(r=e[t],(r==="-"||r==="+")&&(r=e[++t]),r==="0"){if(t+1===n)return!0;if(r=e[++t],r==="b"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!Un(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="o"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!Hn(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}}if(r==="_")return!1;for(;t<n;t++)if(r=e[t],r!=="_"){if(!qn(e.charCodeAt(t)))return!1;i=!0}return!(!i||r==="_")}function Gn(e){var n=e,t=1,i;if(n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),i=n[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),n=n.slice(1),i=n[0]),n==="0")return 0;if(i==="0"){if(n[1]==="b")return t*parseInt(n.slice(2),2);if(n[1]==="x")return t*parseInt(n.slice(2),16);if(n[1]==="o")return t*parseInt(n.slice(2),8)}return t*parseInt(n,10)}function Qn(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!b.isNegativeZero(e)}var Xn=new v("tag:yaml.org,2002:int",{kind:"scalar",resolve:Vn,construct:Gn,predicate:Qn,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Jn=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Zn(e){return!(e===null||!Jn.test(e)||e[e.length-1]==="_")}function et(e){var n,t;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:t*parseFloat(n,10)}var nt=/^[-+]?[0-9]+e/;function tt(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(b.isNegativeZero(e))return"-0.0";return t=e.toString(10),nt.test(t)?t.replace("e",".e"):t}function rt(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||b.isNegativeZero(e))}var it=new v("tag:yaml.org,2002:float",{kind:"scalar",resolve:Zn,construct:et,predicate:rt,represent:tt,defaultStyle:"lowercase"}),ot=jn.extend({implicit:[Dn,Kn,Xn,it]}),lt=ot,Le=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Me=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function at(e){return e===null?!1:Le.exec(e)!==null||Me.exec(e)!==null}function ut(e){var n,t,i,r,l,o,a,u=0,c=null,f,s,d;if(n=Le.exec(e),n===null&&(n=Me.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],i=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(t,i,r));if(l=+n[4],o=+n[5],a=+n[6],n[7]){for(u=n[7].slice(0,3);u.length<3;)u+="0";u=+u}return n[9]&&(f=+n[10],s=+(n[11]||0),c=(f*60+s)*6e4,n[9]==="-"&&(c=-c)),d=new Date(Date.UTC(t,i,r,l,o,a,u)),c&&d.setTime(d.getTime()-c),d}function ct(e){return e.toISOString()}var st=new v("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:at,construct:ut,instanceOf:Date,represent:ct});function ft(e){return e==="<<"||e===null}var pt=new v("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ft}),oe=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function dt(e){if(e===null)return!1;var n,t,i=0,r=e.length,l=oe;for(t=0;t<r;t++)if(n=l.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;i+=6}return i%8===0}function ht(e){var n,t,i=e.replace(/[\r\n=]/g,""),r=i.length,l=oe,o=0,a=[];for(n=0;n<r;n++)n%4===0&&n&&(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)),o=o<<6|l.indexOf(i.charAt(n));return t=r%4*6,t===0?(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)):t===18?(a.push(o>>10&255),a.push(o>>2&255)):t===12&&a.push(o>>4&255),new Uint8Array(a)}function mt(e){var n="",t=0,i,r,l=e.length,o=oe;for(i=0;i<l;i++)i%3===0&&i&&(n+=o[t>>18&63],n+=o[t>>12&63],n+=o[t>>6&63],n+=o[t&63]),t=(t<<8)+e[i];return r=l%3,r===0?(n+=o[t>>18&63],n+=o[t>>12&63],n+=o[t>>6&63],n+=o[t&63]):r===2?(n+=o[t>>10&63],n+=o[t>>4&63],n+=o[t<<2&63],n+=o[64]):r===1&&(n+=o[t>>2&63],n+=o[t<<4&63],n+=o[64],n+=o[64]),n}function gt(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var yt=new v("tag:yaml.org,2002:binary",{kind:"scalar",resolve:dt,construct:ht,predicate:gt,represent:mt}),xt=Object.prototype.hasOwnProperty,wt=Object.prototype.toString;function bt(e){if(e===null)return!0;var n=[],t,i,r,l,o,a=e;for(t=0,i=a.length;t<i;t+=1){if(r=a[t],o=!1,wt.call(r)!=="[object Object]")return!1;for(l in r)if(xt.call(r,l))if(!o)o=!0;else return!1;if(!o)return!1;if(n.indexOf(l)===-1)n.push(l);else return!1}return!0}function vt(e){return e!==null?e:[]}var At=new v("tag:yaml.org,2002:omap",{kind:"sequence",resolve:bt,construct:vt}),Ct=Object.prototype.toString;function St(e){if(e===null)return!0;var n,t,i,r,l,o=e;for(l=new Array(o.length),n=0,t=o.length;n<t;n+=1){if(i=o[n],Ct.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;l[n]=[r[0],i[r[0]]]}return!0}function kt(e){if(e===null)return[];var n,t,i,r,l,o=e;for(l=new Array(o.length),n=0,t=o.length;n<t;n+=1)i=o[n],r=Object.keys(i),l[n]=[r[0],i[r[0]]];return l}var Et=new v("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:St,construct:kt}),Ft=Object.prototype.hasOwnProperty;function Tt(e){if(e===null)return!0;var n,t=e;for(n in t)if(Ft.call(t,n)&&t[n]!==null)return!1;return!0}function It(e){return e!==null?e:{}}var Ot=new v("tag:yaml.org,2002:set",{kind:"mapping",resolve:Tt,construct:It}),Pe=lt.extend({implicit:[st,pt],explicit:[yt,At,Et,Ot]}),I=Object.prototype.hasOwnProperty,$=1,je=2,Re=3,Y=4,Z=1,Nt=2,ye=3,_t=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Lt=/[\x85\u2028\u2029]/,Mt=/[,\[\]\{\}]/,Be=/^(?:!|!!|![a-z\-]+!)$/i,We=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function xe(e){return Object.prototype.toString.call(e)}function E(e){return e===10||e===13}function N(e){return e===9||e===32}function S(e){return e===9||e===32||e===10||e===13}function L(e){return e===44||e===91||e===93||e===123||e===125}function Pt(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function jt(e){return e===120?2:e===117?4:e===85?8:0}function Rt(e){return 48<=e&&e<=57?e-48:-1}function we(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"\x85":e===95?"\xA0":e===76?"\u2028":e===80?"\u2029":""}function Bt(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function De(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var ze=new Array(256),$e=new Array(256);for(O=0;O<256;O++)ze[O]=we(O)?1:0,$e[O]=we(O);var O;function Wt(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||Pe,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function Ye(e,n){var t={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return t.snippet=En(t),new C(n,t)}function p(e,n){throw Ye(e,n)}function K(e,n){e.onWarning&&e.onWarning.call(null,Ye(e,n))}var be={YAML:function(n,t,i){var r,l,o;n.version!==null&&p(n,"duplication of %YAML directive"),i.length!==1&&p(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&p(n,"ill-formed argument of the YAML directive"),l=parseInt(r[1],10),o=parseInt(r[2],10),l!==1&&p(n,"unacceptable YAML version of the document"),n.version=i[0],n.checkLineBreaks=o<2,o!==1&&o!==2&&K(n,"unsupported YAML version of the document")},TAG:function(n,t,i){var r,l;i.length!==2&&p(n,"TAG directive accepts exactly two arguments"),r=i[0],l=i[1],Be.test(r)||p(n,"ill-formed tag handle (first argument) of the TAG directive"),I.call(n.tagMap,r)&&p(n,'there is a previously declared suffix for "'+r+'" tag handle'),We.test(l)||p(n,"ill-formed tag prefix (second argument) of the TAG directive");try{l=decodeURIComponent(l)}catch{p(n,"tag prefix is malformed: "+l)}n.tagMap[r]=l}};function T(e,n,t,i){var r,l,o,a;if(n<t){if(a=e.input.slice(n,t),i)for(r=0,l=a.length;r<l;r+=1)o=a.charCodeAt(r),o===9||32<=o&&o<=1114111||p(e,"expected valid JSON character");else _t.test(a)&&p(e,"the stream contains non-printable characters");e.result+=a}}function ve(e,n,t,i){var r,l,o,a;for(b.isObject(t)||p(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),o=0,a=r.length;o<a;o+=1)l=r[o],I.call(n,l)||(De(n,l,t[l]),i[l]=!0)}function M(e,n,t,i,r,l,o,a,u){var c,f;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),c=0,f=r.length;c<f;c+=1)Array.isArray(r[c])&&p(e,"nested arrays are not supported inside keys"),typeof r=="object"&&xe(r[c])==="[object Object]"&&(r[c]="[object Object]");if(typeof r=="object"&&xe(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(l))for(c=0,f=l.length;c<f;c+=1)ve(e,n,l[c],t);else ve(e,n,l,t);else!e.json&&!I.call(t,r)&&I.call(n,r)&&(e.line=o||e.line,e.lineStart=a||e.lineStart,e.position=u||e.position,p(e,"duplicated mapping key")),De(n,r,l),delete t[r];return n}function le(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):p(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function w(e,n,t){for(var i=0,r=e.input.charCodeAt(e.position);r!==0;){for(;N(r);)r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(E(r))for(le(e),r=e.input.charCodeAt(e.position),i++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return t!==-1&&i!==0&&e.lineIndent<t&&K(e,"deficient indentation"),i}function q(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||S(t)))}function ae(e,n){n===1?e.result+=" ":n>1&&(e.result+=b.repeat(`
`,n-1))}function Dt(e,n,t){var i,r,l,o,a,u,c,f,s=e.kind,d=e.result,h;if(h=e.input.charCodeAt(e.position),S(h)||L(h)||h===35||h===38||h===42||h===33||h===124||h===62||h===39||h===34||h===37||h===64||h===96||(h===63||h===45)&&(r=e.input.charCodeAt(e.position+1),S(r)||t&&L(r)))return!1;for(e.kind="scalar",e.result="",l=o=e.position,a=!1;h!==0;){if(h===58){if(r=e.input.charCodeAt(e.position+1),S(r)||t&&L(r))break}else if(h===35){if(i=e.input.charCodeAt(e.position-1),S(i))break}else{if(e.position===e.lineStart&&q(e)||t&&L(h))break;if(E(h))if(u=e.line,c=e.lineStart,f=e.lineIndent,w(e,!1,-1),e.lineIndent>=n){a=!0,h=e.input.charCodeAt(e.position);continue}else{e.position=o,e.line=u,e.lineStart=c,e.lineIndent=f;break}}a&&(T(e,l,o,!1),ae(e,e.line-u),l=o=e.position,a=!1),N(h)||(o=e.position+1),h=e.input.charCodeAt(++e.position)}return T(e,l,o,!1),e.result?!0:(e.kind=s,e.result=d,!1)}function zt(e,n){var t,i,r;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(T(e,i,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)i=e.position,e.position++,r=e.position;else return!0;else E(t)?(T(e,i,r,!0),ae(e,w(e,!1,n)),i=r=e.position):e.position===e.lineStart&&q(e)?p(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);p(e,"unexpected end of the stream within a single quoted scalar")}function $t(e,n){var t,i,r,l,o,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=i=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return T(e,t,e.position,!0),e.position++,!0;if(a===92){if(T(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),E(a))w(e,!1,n);else if(a<256&&ze[a])e.result+=$e[a],e.position++;else if((o=jt(a))>0){for(r=o,l=0;r>0;r--)a=e.input.charCodeAt(++e.position),(o=Pt(a))>=0?l=(l<<4)+o:p(e,"expected hexadecimal character");e.result+=Bt(l),e.position++}else p(e,"unknown escape sequence");t=i=e.position}else E(a)?(T(e,t,i,!0),ae(e,w(e,!1,n)),t=i=e.position):e.position===e.lineStart&&q(e)?p(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}p(e,"unexpected end of the stream within a double quoted scalar")}function Yt(e,n){var t=!0,i,r,l,o=e.tag,a,u=e.anchor,c,f,s,d,h,m=Object.create(null),y,x,k,g;if(g=e.input.charCodeAt(e.position),g===91)f=93,h=!1,a=[];else if(g===123)f=125,h=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),g=e.input.charCodeAt(++e.position);g!==0;){if(w(e,!0,n),g=e.input.charCodeAt(e.position),g===f)return e.position++,e.tag=o,e.anchor=u,e.kind=h?"mapping":"sequence",e.result=a,!0;t?g===44&&p(e,"expected the node content, but found ','"):p(e,"missed comma between flow collection entries"),x=y=k=null,s=d=!1,g===63&&(c=e.input.charCodeAt(e.position+1),S(c)&&(s=d=!0,e.position++,w(e,!0,n))),i=e.line,r=e.lineStart,l=e.position,P(e,n,$,!1,!0),x=e.tag,y=e.result,w(e,!0,n),g=e.input.charCodeAt(e.position),(d||e.line===i)&&g===58&&(s=!0,g=e.input.charCodeAt(++e.position),w(e,!0,n),P(e,n,$,!1,!0),k=e.result),h?M(e,a,m,x,y,k,i,r,l):s?a.push(M(e,null,m,x,y,k,i,r,l)):a.push(y),w(e,!0,n),g=e.input.charCodeAt(e.position),g===44?(t=!0,g=e.input.charCodeAt(++e.position)):t=!1}p(e,"unexpected end of the stream within a flow collection")}function Kt(e,n){var t,i,r=Z,l=!1,o=!1,a=n,u=0,c=!1,f,s;if(s=e.input.charCodeAt(e.position),s===124)i=!1;else if(s===62)i=!0;else return!1;for(e.kind="scalar",e.result="";s!==0;)if(s=e.input.charCodeAt(++e.position),s===43||s===45)Z===r?r=s===43?ye:Nt:p(e,"repeat of a chomping mode identifier");else if((f=Rt(s))>=0)f===0?p(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?p(e,"repeat of an indentation width identifier"):(a=n+f-1,o=!0);else break;if(N(s)){do s=e.input.charCodeAt(++e.position);while(N(s));if(s===35)do s=e.input.charCodeAt(++e.position);while(!E(s)&&s!==0)}for(;s!==0;){for(le(e),e.lineIndent=0,s=e.input.charCodeAt(e.position);(!o||e.lineIndent<a)&&s===32;)e.lineIndent++,s=e.input.charCodeAt(++e.position);if(!o&&e.lineIndent>a&&(a=e.lineIndent),E(s)){u++;continue}if(e.lineIndent<a){r===ye?e.result+=b.repeat(`
`,l?1+u:u):r===Z&&l&&(e.result+=`
`);break}for(i?N(s)?(c=!0,e.result+=b.repeat(`
`,l?1+u:u)):c?(c=!1,e.result+=b.repeat(`
`,u+1)):u===0?l&&(e.result+=" "):e.result+=b.repeat(`
`,u):e.result+=b.repeat(`
`,l?1+u:u),l=!0,o=!0,u=0,t=e.position;!E(s)&&s!==0;)s=e.input.charCodeAt(++e.position);T(e,t,e.position,!1)}return!0}function Ae(e,n){var t,i=e.tag,r=e.anchor,l=[],o,a=!1,u;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=l),u=e.input.charCodeAt(e.position);u!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,p(e,"tab characters must not be used in indentation")),!(u!==45||(o=e.input.charCodeAt(e.position+1),!S(o))));){if(a=!0,e.position++,w(e,!0,-1)&&e.lineIndent<=n){l.push(null),u=e.input.charCodeAt(e.position);continue}if(t=e.line,P(e,n,Re,!1,!0),l.push(e.result),w(e,!0,-1),u=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&u!==0)p(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=i,e.anchor=r,e.kind="sequence",e.result=l,!0):!1}function Ut(e,n,t){var i,r,l,o,a,u,c=e.tag,f=e.anchor,s={},d=Object.create(null),h=null,m=null,y=null,x=!1,k=!1,g;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),g=e.input.charCodeAt(e.position);g!==0;){if(!x&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,p(e,"tab characters must not be used in indentation")),i=e.input.charCodeAt(e.position+1),l=e.line,(g===63||g===58)&&S(i))g===63?(x&&(M(e,s,d,h,m,null,o,a,u),h=m=y=null),k=!0,x=!0,r=!0):x?(x=!1,r=!0):p(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,g=i;else{if(o=e.line,a=e.lineStart,u=e.position,!P(e,t,je,!1,!0))break;if(e.line===l){for(g=e.input.charCodeAt(e.position);N(g);)g=e.input.charCodeAt(++e.position);if(g===58)g=e.input.charCodeAt(++e.position),S(g)||p(e,"a whitespace character is expected after the key-value separator within a block mapping"),x&&(M(e,s,d,h,m,null,o,a,u),h=m=y=null),k=!0,x=!1,r=!1,h=e.tag,m=e.result;else if(k)p(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=c,e.anchor=f,!0}else if(k)p(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=c,e.anchor=f,!0}if((e.line===l||e.lineIndent>n)&&(x&&(o=e.line,a=e.lineStart,u=e.position),P(e,n,Y,!0,r)&&(x?m=e.result:y=e.result),x||(M(e,s,d,h,m,y,o,a,u),h=m=y=null),w(e,!0,-1),g=e.input.charCodeAt(e.position)),(e.line===l||e.lineIndent>n)&&g!==0)p(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return x&&M(e,s,d,h,m,null,o,a,u),k&&(e.tag=c,e.anchor=f,e.kind="mapping",e.result=s),k}function Ht(e){var n,t=!1,i=!1,r,l,o;if(o=e.input.charCodeAt(e.position),o!==33)return!1;if(e.tag!==null&&p(e,"duplication of a tag property"),o=e.input.charCodeAt(++e.position),o===60?(t=!0,o=e.input.charCodeAt(++e.position)):o===33?(i=!0,r="!!",o=e.input.charCodeAt(++e.position)):r="!",n=e.position,t){do o=e.input.charCodeAt(++e.position);while(o!==0&&o!==62);e.position<e.length?(l=e.input.slice(n,e.position),o=e.input.charCodeAt(++e.position)):p(e,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!S(o);)o===33&&(i?p(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),Be.test(r)||p(e,"named tag handle cannot contain such characters"),i=!0,n=e.position+1)),o=e.input.charCodeAt(++e.position);l=e.input.slice(n,e.position),Mt.test(l)&&p(e,"tag suffix cannot contain flow indicator characters")}l&&!We.test(l)&&p(e,"tag name cannot contain such characters: "+l);try{l=decodeURIComponent(l)}catch{p(e,"tag name is malformed: "+l)}return t?e.tag=l:I.call(e.tagMap,r)?e.tag=e.tagMap[r]+l:r==="!"?e.tag="!"+l:r==="!!"?e.tag="tag:yaml.org,2002:"+l:p(e,'undeclared tag handle "'+r+'"'),!0}function qt(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&p(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!S(t)&&!L(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&p(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Vt(e){var n,t,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!S(i)&&!L(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&p(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),I.call(e.anchorMap,t)||p(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],w(e,!0,-1),!0}function P(e,n,t,i,r){var l,o,a,u=1,c=!1,f=!1,s,d,h,m,y,x;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,l=o=a=Y===t||Re===t,i&&w(e,!0,-1)&&(c=!0,e.lineIndent>n?u=1:e.lineIndent===n?u=0:e.lineIndent<n&&(u=-1)),u===1)for(;Ht(e)||qt(e);)w(e,!0,-1)?(c=!0,a=l,e.lineIndent>n?u=1:e.lineIndent===n?u=0:e.lineIndent<n&&(u=-1)):a=!1;if(a&&(a=c||r),(u===1||Y===t)&&($===t||je===t?y=n:y=n+1,x=e.position-e.lineStart,u===1?a&&(Ae(e,x)||Ut(e,x,y))||Yt(e,y)?f=!0:(o&&Kt(e,y)||zt(e,y)||$t(e,y)?f=!0:Vt(e)?(f=!0,(e.tag!==null||e.anchor!==null)&&p(e,"alias node should not have any properties")):Dt(e,y,$===t)&&(f=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):u===0&&(f=a&&Ae(e,x))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&p(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),s=0,d=e.implicitTypes.length;s<d;s+=1)if(m=e.implicitTypes[s],m.resolve(e.result)){e.result=m.construct(e.result),e.tag=m.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(I.call(e.typeMap[e.kind||"fallback"],e.tag))m=e.typeMap[e.kind||"fallback"][e.tag];else for(m=null,h=e.typeMap.multi[e.kind||"fallback"],s=0,d=h.length;s<d;s+=1)if(e.tag.slice(0,h[s].tag.length)===h[s].tag){m=h[s];break}m||p(e,"unknown tag !<"+e.tag+">"),e.result!==null&&m.kind!==e.kind&&p(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+m.kind+'", not "'+e.kind+'"'),m.resolve(e.result,e.tag)?(e.result=m.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):p(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||f}function Gt(e){var n=e.position,t,i,r,l=!1,o;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(o=e.input.charCodeAt(e.position))!==0&&(w(e,!0,-1),o=e.input.charCodeAt(e.position),!(e.lineIndent>0||o!==37));){for(l=!0,o=e.input.charCodeAt(++e.position),t=e.position;o!==0&&!S(o);)o=e.input.charCodeAt(++e.position);for(i=e.input.slice(t,e.position),r=[],i.length<1&&p(e,"directive name must not be less than one character in length");o!==0;){for(;N(o);)o=e.input.charCodeAt(++e.position);if(o===35){do o=e.input.charCodeAt(++e.position);while(o!==0&&!E(o));break}if(E(o))break;for(t=e.position;o!==0&&!S(o);)o=e.input.charCodeAt(++e.position);r.push(e.input.slice(t,e.position))}o!==0&&le(e),I.call(be,i)?be[i](e,i,r):K(e,'unknown document directive "'+i+'"')}if(w(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,w(e,!0,-1)):l&&p(e,"directives end mark is expected"),P(e,e.lineIndent-1,Y,!1,!0),w(e,!0,-1),e.checkLineBreaks&&Lt.test(e.input.slice(n,e.position))&&K(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&q(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,w(e,!0,-1));return}if(e.position<e.length-1)p(e,"end of the stream or a document separator is expected");else return}function Ke(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new Wt(e,n),i=e.indexOf("\0");for(i!==-1&&(t.position=i,p(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Gt(t);return t.documents}function Qt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var i=Ke(e,t);if(typeof n!="function")return i;for(var r=0,l=i.length;r<l;r+=1)n(i[r])}function Xt(e,n){var t=Ke(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new C("expected a single document in the stream, but found more")}}var Jt=Qt,Zt=Xt,Ue={loadAll:Jt,load:Zt},He=Object.prototype.toString,qe=Object.prototype.hasOwnProperty,ue=65279,er=9,W=10,nr=13,tr=32,rr=33,ir=34,ne=35,or=37,lr=38,ar=39,ur=42,Ve=44,cr=45,U=58,sr=61,fr=62,pr=63,dr=64,Ge=91,Qe=93,hr=96,Xe=123,mr=124,Je=125,A={};A[0]="\\0";A[7]="\\a";A[8]="\\b";A[9]="\\t";A[10]="\\n";A[11]="\\v";A[12]="\\f";A[13]="\\r";A[27]="\\e";A[34]='\\"';A[92]="\\\\";A[133]="\\N";A[160]="\\_";A[8232]="\\L";A[8233]="\\P";var gr=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],yr=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function xr(e,n){var t,i,r,l,o,a,u;if(n===null)return{};for(t={},i=Object.keys(n),r=0,l=i.length;r<l;r+=1)o=i[r],a=String(n[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),u=e.compiledTypeMap.fallback[o],u&&qe.call(u.styleAliases,a)&&(a=u.styleAliases[a]),t[o]=a;return t}function wr(e){var n,t,i;if(n=e.toString(16).toUpperCase(),e<=255)t="x",i=2;else if(e<=65535)t="u",i=4;else if(e<=4294967295)t="U",i=8;else throw new C("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+b.repeat("0",i-n.length)+n}var br=1,D=2;function vr(e){this.schema=e.schema||Pe,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=b.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=xr(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?D:br,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Ce(e,n){for(var t=b.repeat(" ",n),i=0,r=-1,l="",o,a=e.length;i<a;)r=e.indexOf(`
`,i),r===-1?(o=e.slice(i),i=a):(o=e.slice(i,r+1),i=r+1),o.length&&o!==`
`&&(l+=t),l+=o;return l}function te(e,n){return`
`+b.repeat(" ",e.indent*n)}function Ar(e,n){var t,i,r;for(t=0,i=e.implicitTypes.length;t<i;t+=1)if(r=e.implicitTypes[t],r.resolve(n))return!0;return!1}function H(e){return e===tr||e===er}function z(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==ue||65536<=e&&e<=1114111}function Se(e){return z(e)&&e!==ue&&e!==nr&&e!==W}function ke(e,n,t){var i=Se(e),r=i&&!H(e);return(t?i:i&&e!==Ve&&e!==Ge&&e!==Qe&&e!==Xe&&e!==Je)&&e!==ne&&!(n===U&&!r)||Se(n)&&!H(n)&&e===ne||n===U&&r}function Cr(e){return z(e)&&e!==ue&&!H(e)&&e!==cr&&e!==pr&&e!==U&&e!==Ve&&e!==Ge&&e!==Qe&&e!==Xe&&e!==Je&&e!==ne&&e!==lr&&e!==ur&&e!==rr&&e!==mr&&e!==sr&&e!==fr&&e!==ar&&e!==ir&&e!==or&&e!==dr&&e!==hr}function Sr(e){return!H(e)&&e!==U}function R(e,n){var t=e.charCodeAt(n),i;return t>=55296&&t<=56319&&n+1<e.length&&(i=e.charCodeAt(n+1),i>=56320&&i<=57343)?(t-55296)*1024+i-56320+65536:t}function Ze(e){var n=/^\n* /;return n.test(e)}var en=1,re=2,nn=3,tn=4,_=5;function kr(e,n,t,i,r,l,o,a){var u,c=0,f=null,s=!1,d=!1,h=i!==-1,m=-1,y=Cr(R(e,0))&&Sr(R(e,e.length-1));if(n||o)for(u=0;u<e.length;c>=65536?u+=2:u++){if(c=R(e,u),!z(c))return _;y=y&&ke(c,f,a),f=c}else{for(u=0;u<e.length;c>=65536?u+=2:u++){if(c=R(e,u),c===W)s=!0,h&&(d=d||u-m-1>i&&e[m+1]!==" ",m=u);else if(!z(c))return _;y=y&&ke(c,f,a),f=c}d=d||h&&u-m-1>i&&e[m+1]!==" "}return!s&&!d?y&&!o&&!r(e)?en:l===D?_:re:t>9&&Ze(e)?_:o?l===D?_:re:d?tn:nn}function Er(e,n,t,i,r){e.dump=(function(){if(n.length===0)return e.quotingType===D?'""':"''";if(!e.noCompatMode&&(gr.indexOf(n)!==-1||yr.test(n)))return e.quotingType===D?'"'+n+'"':"'"+n+"'";var l=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-l),a=i||e.flowLevel>-1&&t>=e.flowLevel;function u(c){return Ar(e,c)}switch(kr(n,a,e.indent,o,u,e.quotingType,e.forceQuotes&&!i,r)){case en:return n;case re:return"'"+n.replace(/'/g,"''")+"'";case nn:return"|"+Ee(n,e.indent)+Fe(Ce(n,l));case tn:return">"+Ee(n,e.indent)+Fe(Ce(Fr(n,o),l));case _:return'"'+Tr(n)+'"';default:throw new C("impossible error: invalid scalar style")}})()}function Ee(e,n){var t=Ze(e)?String(n):"",i=e[e.length-1]===`
`,r=i&&(e[e.length-2]===`
`||e===`
`),l=r?"+":i?"":"-";return t+l+`
`}function Fe(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Fr(e,n){for(var t=/(\n+)([^\n]*)/g,i=(function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,Te(e.slice(0,c),n)})(),r=e[0]===`
`||e[0]===" ",l,o;o=t.exec(e);){var a=o[1],u=o[2];l=u[0]===" ",i+=a+(!r&&!l&&u!==""?`
`:"")+Te(u,n),r=l}return i}function Te(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,i,r=0,l,o=0,a=0,u="";i=t.exec(e);)a=i.index,a-r>n&&(l=o>r?o:a,u+=`
`+e.slice(r,l),r=l+1),o=a;return u+=`
`,e.length-r>n&&o>r?u+=e.slice(r,o)+`
`+e.slice(o+1):u+=e.slice(r),u.slice(1)}function Tr(e){for(var n="",t=0,i,r=0;r<e.length;t>=65536?r+=2:r++)t=R(e,r),i=A[t],!i&&z(t)?(n+=e[r],t>=65536&&(n+=e[r+1])):n+=i||wr(t);return n}function Ir(e,n,t){var i="",r=e.tag,l,o,a;for(l=0,o=t.length;l<o;l+=1)a=t[l],e.replacer&&(a=e.replacer.call(t,String(l),a)),(F(e,n,a,!1,!1)||typeof a>"u"&&F(e,n,null,!1,!1))&&(i!==""&&(i+=","+(e.condenseFlow?"":" ")),i+=e.dump);e.tag=r,e.dump="["+i+"]"}function Ie(e,n,t,i){var r="",l=e.tag,o,a,u;for(o=0,a=t.length;o<a;o+=1)u=t[o],e.replacer&&(u=e.replacer.call(t,String(o),u)),(F(e,n+1,u,!0,!0,!1,!0)||typeof u>"u"&&F(e,n+1,null,!0,!0,!1,!0))&&((!i||r!=="")&&(r+=te(e,n)),e.dump&&W===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=l,e.dump=r||"[]"}function Or(e,n,t){var i="",r=e.tag,l=Object.keys(t),o,a,u,c,f;for(o=0,a=l.length;o<a;o+=1)f="",i!==""&&(f+=", "),e.condenseFlow&&(f+='"'),u=l[o],c=t[u],e.replacer&&(c=e.replacer.call(t,u,c)),F(e,n,u,!1,!1)&&(e.dump.length>1024&&(f+="? "),f+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),F(e,n,c,!1,!1)&&(f+=e.dump,i+=f));e.tag=r,e.dump="{"+i+"}"}function Nr(e,n,t,i){var r="",l=e.tag,o=Object.keys(t),a,u,c,f,s,d;if(e.sortKeys===!0)o.sort();else if(typeof e.sortKeys=="function")o.sort(e.sortKeys);else if(e.sortKeys)throw new C("sortKeys must be a boolean or a function");for(a=0,u=o.length;a<u;a+=1)d="",(!i||r!=="")&&(d+=te(e,n)),c=o[a],f=t[c],e.replacer&&(f=e.replacer.call(t,c,f)),F(e,n+1,c,!0,!0,!0)&&(s=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,s&&(e.dump&&W===e.dump.charCodeAt(0)?d+="?":d+="? "),d+=e.dump,s&&(d+=te(e,n)),F(e,n+1,f,!0,s)&&(e.dump&&W===e.dump.charCodeAt(0)?d+=":":d+=": ",d+=e.dump,r+=d));e.tag=l,e.dump=r||"{}"}function Oe(e,n,t){var i,r,l,o,a,u;for(r=t?e.explicitTypes:e.implicitTypes,l=0,o=r.length;l<o;l+=1)if(a=r[l],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(t?a.multi&&a.representName?e.tag=a.representName(n):e.tag=a.tag:e.tag="?",a.represent){if(u=e.styleMap[a.tag]||a.defaultStyle,He.call(a.represent)==="[object Function]")i=a.represent(n,u);else if(qe.call(a.represent,u))i=a.represent[u](n,u);else throw new C("!<"+a.tag+'> tag resolver accepts not "'+u+'" style');e.dump=i}return!0}return!1}function F(e,n,t,i,r,l,o){e.tag=null,e.dump=t,Oe(e,t,!1)||Oe(e,t,!0);var a=He.call(e.dump),u=i,c;i&&(i=e.flowLevel<0||e.flowLevel>n);var f=a==="[object Object]"||a==="[object Array]",s,d;if(f&&(s=e.duplicates.indexOf(t),d=s!==-1),(e.tag!==null&&e.tag!=="?"||d||e.indent!==2&&n>0)&&(r=!1),d&&e.usedDuplicates[s])e.dump="*ref_"+s;else{if(f&&d&&!e.usedDuplicates[s]&&(e.usedDuplicates[s]=!0),a==="[object Object]")i&&Object.keys(e.dump).length!==0?(Nr(e,n,e.dump,r),d&&(e.dump="&ref_"+s+e.dump)):(Or(e,n,e.dump),d&&(e.dump="&ref_"+s+" "+e.dump));else if(a==="[object Array]")i&&e.dump.length!==0?(e.noArrayIndent&&!o&&n>0?Ie(e,n-1,e.dump,r):Ie(e,n,e.dump,r),d&&(e.dump="&ref_"+s+e.dump)):(Ir(e,n,e.dump),d&&(e.dump="&ref_"+s+" "+e.dump));else if(a==="[object String]")e.tag!=="?"&&Er(e,e.dump,n,l,u);else{if(a==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new C("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(c=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",e.dump=c+" "+e.dump)}return!0}function _r(e,n){var t=[],i=[],r,l;for(ie(e,t,i),r=0,l=i.length;r<l;r+=1)n.duplicates.push(t[i[r]]);n.usedDuplicates=new Array(l)}function ie(e,n,t){var i,r,l;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(n.push(e),Array.isArray(e))for(r=0,l=e.length;r<l;r+=1)ie(e[r],n,t);else for(i=Object.keys(e),r=0,l=i.length;r<l;r+=1)ie(e[i[r]],n,t)}function Lr(e,n){n=n||{};var t=new vr(n);t.noRefs||_r(e,t);var i=e;return t.replacer&&(i=t.replacer.call({"":i},"",i)),F(t,0,i,!0,!0)?t.dump+`
`:""}var Mr=Lr,Pr={dump:Mr};function ce(e,n){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+n+" instead, which is now safe by default.")}}var rn=Ue.load,Vr=Ue.loadAll,jr=Pr.dump;var Gr=ce("safeLoad","load"),Qr=ce("safeLoadAll","loadAll"),Xr=ce("safeDump","dump");function Rr(e){let n=rn(e??"");return n??{}}function on(e,n){let i=["Obsidian Base",Br(e).split("/").pop()?.replace(/\.base$/i,"")??""];try{let r=Rr(n);se(r,i)}catch{}return i.push(n),Wr(i.flatMap(Dr)).filter(Boolean).join(`
`)}function Br(e){return e.replace(/^\/+/,"").replace(/\\/g,"/")}function Wr(e){return[...new Set(e)]}function se(e,n){if(e!=null){if(Array.isArray(e)){for(let t of e)se(t,n);return}if(typeof e=="object"){for(let[t,i]of Object.entries(e))n.push(t),se(i,n);return}n.push(String(e))}}function Dr(e){return String(e).split(/\r?\n/).map(n=>n.trim())}var zr=new TextDecoder;async function ln(e){let n=e?.meta??{},t=n.name??n.path??"";if(!t.toLowerCase().endsWith(".base"))return null;let i=await syscall("space.readFile",t),r=typeof i=="string"?i:zr.decode(i);return{content:on(t,r),cacheMode:"session"}}var an={editor:me,indexBaseDocument:ln},un={name:"obsidian-bases",functions:{editor:{path:"./src/editor.js:editor",editor:["base"]},indexBaseDocument:{path:"./src/silversearch.js:indexBaseDocument",events:["silversearch:index"]}},assets:{}},li={manifest:un,functionMapping:an};de(an,un,self.postMessage);export{li as plug};
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=obsidian-bases.plug.js.map
