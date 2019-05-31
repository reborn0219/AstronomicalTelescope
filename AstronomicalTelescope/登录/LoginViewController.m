//
//  LoginViewController.m
//  AstronomicalTelescope
//
//  Created by yang on 2019/5/27.
//  Copyright © 2019 yang. All rights reserved.
//

#import "LoginViewController.h"

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

}

@end
