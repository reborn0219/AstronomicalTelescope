//
//  WebViewVC.m
//  TimeHomeApp
//
//  Created by us on 16/1/26.
//  Copyright © 2016年 石家庄优思交通智能科技有限公司. All rights reserved.

#import "WebViewVC.h"
#import "PhoneInterface.h"
#import <WebKit/WebKit.h>
#import "AppDelegate.h"
#import "MessageBoxVC.h"
@interface WebViewVC ()<UIWebViewDelegate>
{
    
    PhoneInterface *ustimes;///JS 交互对象
   
}
@property (nonatomic,strong) UIWebView *webView;

@end

@implementation WebViewVC


#pragma  mark - LifeCircle

- (void)viewDidLoad {
    
    [super viewDidLoad];
   

    AppDelegate * appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    
    appDelegate.allowRotation = YES;//(以上2行代码,可以理解为打开横屏开关)
    
    [self setNewOrientation:YES];
    self.view.backgroundColor = [UIColor blackColor];
    self.webView = [[UIWebView alloc]initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)];
    [self.view addSubview:self.webView];
    self.automaticallyAdjustsScrollViewInsets = NO;
    self.webView.delegate = self;
    ustimes=[[PhoneInterface alloc]init];
    ustimes.webVC = self;
    self.webView.backgroundColor = [UIColor blackColor];
    self.webView.dataDetectorTypes = UIDataDetectorTypeNone;//禁止自动检测网页上的电话号码，单机可以拨打
    
    self.webView.scrollView.decelerationRate = UIScrollViewDecelerationRateNormal;
    
    
    self.webView.allowsInlineMediaPlayback = YES;
    NSString *path = [[NSBundle mainBundle] pathForResource:@"Main.html" ofType:nil];
    NSString *htmlString = [[NSString alloc]initWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
    [_webView loadHTMLString:htmlString baseURL:[NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]]];


  

}


-(void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.navigationController.interactivePopGestureRecognizer.enabled = NO;
    /** 设置详情页导航栏标题 */
  
    
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    self.navigationItem.titleView = nil;
//
//    JSValue *add = self.context[@"webViewWillDisappear"];
//    NSLog(@"Func==webViewWillDisappear: %@", add);
//    NSDictionary *callBackDict = @{@"version":kCurrentVersion};
//
//
//    NSString * str = [_webView stringByEvaluatingJavaScriptFromString:@"window.location.href"];
//
//    if (![str containsString:@"writeMessage.html"]) {
//
//        [self insertRowToTop];
//    }
//
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    
}



#pragma mark - UIWebViewDelegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    
    NSString *currenturl = request.URL.absoluteString;
    NSLog(@"currenturl===%@",currenturl);
    
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSLog(@"cookies====%@",[storage cookies]);
    
    return YES;
}
- (void)webViewDidStartLoad:(UIWebView *)webView {}
- (void)webViewDidFinishLoad:(UIWebView *)webView {
    
    
//    /**
//     *  禁止长按系统弹出框
//     */
//    [self.webView stringByEvaluatingJavaScriptFromString:@"document.documentElement.style.webkitUserSelect='none';"];
//    [self.webView stringByEvaluatingJavaScriptFromString:@"document.documentElement.style.webkitTouchCallout='none';"];
//    
//    ///edit by ls 2017.7.25  不设置标题的时候显示网页自带标题
//    if ([XYString isBlankString:self.title]) {
//        self.title= [_webView stringByEvaluatingJavaScriptFromString:@"document.title"];
//    }
//    [self setupDetailsNavWithTitle:self.title];
//    ///edit by ls 2017.7.25
//    
    _context=[webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    
//    _context[@"PhoneInterface"] = ustimes;
//    //同样我们也用刚才的方式模拟一下js调用方法
//    NSString *jsStr1=@"PhoneInterface.ready()";
//    [_context evaluateScript:jsStr1];
    _context[@"test1"] = ^() {
        NSArray *args = [JSContext currentArguments];
        for (id obj in args) {
            NSLog(@"%@",obj);
        }
    };
    
    /** 异常处理 */
    _context.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"webView异常=====%@", exception);
        con.exception = exception;
    };
    
//    JSValue *add = self.context[@"webviewLoadComplete"];
//    NSLog(@"Func==add: %@", add);
//    NSDictionary *callBackDict = @{@"version":kCurrentVersion};
//    [add callWithArguments:@[[callBackDict mj_JSONString]]];
    
}
 
-(void)scan{
    NSLog(@"2222");

}

- (void)setNewOrientation:(BOOL)fullscreen

{
    
    if (fullscreen) {
        
        NSNumber *resetOrientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationUnknown];
        
        [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
        
        
        
        NSNumber *orientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationLandscapeLeft];
        
        [[UIDevice currentDevice] setValue:orientationTarget forKey:@"orientation"];
        
    }else{
        
        NSNumber *resetOrientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationUnknown];
        
        [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
        
        
        
        NSNumber *orientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationPortrait];
        
        [[UIDevice currentDevice] setValue:orientationTarget forKey:@"orientation"];
        
    }
    
}

-(void)ready{
    NSLog(@"ready被调用");
    [self setHost:_ipName];
    
}
-(void)setHost:(NSString *)host{
    JSValue *add = self.context[@"_SetHost"];
    NSLog(@"Func==add: %@", add);
    [add callWithArguments:@[host]];
    [self browserReady];
}
-(void)browserReady{
    JSValue *add = self.context[@"_BrowserReady"];
    NSLog(@"Func==add: %@", add);
    [add callWithArguments:@[]];
}
-(void)showview{
    NSLog(@"showview被调用");
    
    
}
-(NSDictionary *)getGPS{
    NSLog(@"getGPS被调用");
   NSString *lat = [[NSUserDefaults standardUserDefaults] objectForKey:@"latitude"];
    NSString *lng = [[NSUserDefaults standardUserDefaults] objectForKey:@"longitude"];
    NSDateFormatter *formatter = [[NSDateFormatter alloc]init];
    formatter.dateFormat = @"YYYY-MM-dd HH:mm:ss";
    NSString *dateStr = [formatter stringFromDate:[NSDate date]];
    return @{
        @"longitude":lng,
        @"latitude":lat,
        @"datetime":dateStr
    };
}
-(void)gohome{
    NSLog(@"gohome被调用");
    dispatch_async(dispatch_get_main_queue(), ^{
        AppDelegate * appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        
        appDelegate.allowRotation = NO;//关闭横屏仅允许竖屏
        
        [self setNewOrientation:NO];
        [self dismissViewControllerAnimated:YES completion:nil];
    });
 

}
-(void)dialog:(NSString*)title :(NSString*)content :(NSString*)flag :(NSString*)buttons :(NSString*)callid{
    
//    JSValue *add = self.context[@"__MessageBox_Callback"];
//    NSLog(@"Func==add: %@", add);
//    NSDictionary *dic = @{@"callid":callid,@"result":@"0"};
//    [add callWithArguments:@[[dic mj_JSONString]]];
    
    
    
    dispatch_async(dispatch_get_main_queue(), ^{

    MessageBoxVC * messageVC = [[MessageBoxVC alloc]init];
    [messageVC showInVC:self Type:1];
    });

}

@end
