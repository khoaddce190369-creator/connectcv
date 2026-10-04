 'use strict';
const path=require('path'),express=require('express'),helmet=require('helmet'),rateLimit=require('express-rate-limit');
const {featureSecurity}=require('./src/middlewares/featureSecurity');
// authenticate must be a trusted server middleware from the account team.
// Missing authentication always denies mutation. Body IDs are never identity.
module.exports=function mountFeatures(app,{authenticate}={}){
 const base=__dirname;const authenticated=typeof authenticate==='function';
 const headers=helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false});
 app.get('/api/features/health',(req,res)=>res.json({status:'OK',authenticationIntegrated:authenticated,creditsMode:'pending',browserConfigured:!!process.env.CV_BROWSER_WS_ENDPOINT,durableStorageConfigured:!!process.env.FEATURE_STATE_DIR&&process.env.FEATURE_SINGLE_PROCESS==='true'}));
 app.use('/api/cv/source-assets',express.static(path.join(base,'assets/topcv-source/assets'),{maxAge:'1y',immutable:true,setHeaders:res=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Cross-Origin-Resource-Policy','cross-origin');}}));
 const parser=express.json({limit:'15mb'});
 const identity=(req,res,next)=>{if((req.method==='GET'||req.method==='HEAD')&&!String(req.path||'').endsWith('/download-docx'))return next();if(!authenticated)return res.status(503).json({success:false,code:'AUTH_INTEGRATION_REQUIRED',message:'Tính năng đang chờ tích hợp xác thực tài khoản.'});return authenticate(req,res,error=>{if(error)return next(error);req.featureIdentityVerified=true;next();});};
 const limiter=rateLimit({skip:req=>(req.method==='GET'||req.method==='HEAD')&&!String(req.path||'').endsWith('/download-docx'),windowMs:300000,limit:15,standardHeaders:'draft-7',legacyHeaders:false});
 for(const name of ['cv','interview','chatbot'])app.use('/api/'+name,headers,identity,parser,featureSecurity,limiter,require('./src/routes/'+name));
 app.use('/api/upload',identity,(req,res,next)=>req.user?.id?next():res.status(401).json({success:false,code:'AUTH_REQUIRED'}),limiter,require('./src/routes/upload'));
 app.use('/ai',express.static(path.join(base,'public'),{index:'index.html',setHeaders:res=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Security-Policy',"frame-ancestors 'self'; object-src 'none'; base-uri 'self'");}}));
 app.use('/api',(err,req,res,next)=>{if(res.headersSent)return next(err);return res.status(err.status===413?413:500).json({success:false,message:err.status===413?'Dữ liệu vượt giới hạn.':'Không thể xử lý yêu cầu.'});});
};
