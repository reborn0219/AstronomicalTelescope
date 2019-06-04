//
//  LoginViewController.m
//  AstronomicalTelescope
//
//  Created by yang on 2019/5/27.
//  Copyright © 2019 yang. All rights reserved.
//

#import "LoginViewController.h"
#import "SLWebViewController.h"
#import "UDPManage.h"
@interface LoginViewController ()
@property (weak, nonatomic) IBOutlet UIView *backV;
@property (weak, nonatomic) IBOutlet UIView *blueLV;
@property (weak, nonatomic) IBOutlet UIView *blueV;

@end

@implementation LoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.view setBackgroundColor:[UIColor blackColor]];
    self.backV.layer.cornerRadius = 5;
    self.blueLV.layer.cornerRadius = 5;
    self.blueV.layer.cornerRadius = 5;
    UDPManage *mg = [[UDPManage alloc]init];
    [mg startListenClientSocketMessage];
}
- (IBAction)connectDeviceAction:(id)sender {
    SLWebViewController *webVC = [[SLWebViewController alloc]init];
    [self presentViewController:webVC animated:YES completion:nil];
    
}

@end
