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
#import "WebViewVC.h"
#import "WebViewController.h"
#import "PopListCell.h"

@interface LoginViewController ()<UITableViewDelegate,UITableViewDataSource>
@property (weak, nonatomic) IBOutlet UIView *backV;
@property (weak, nonatomic) IBOutlet UIView *blueLV;
@property (weak, nonatomic) IBOutlet UIView *blueV;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *tableView_H;
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UILabel *deviceIPLabel;

@end

@implementation LoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _tableView.delegate = self;
    _tableView.dataSource = self;
    [_tableView registerNib:[UINib nibWithNibName:@"PopListCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"PopListCell"];
    _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    _tableView.estimatedRowHeight=44;
    _tableView.rowHeight=UITableViewAutomaticDimension;
    [self.view setBackgroundColor:[UIColor blackColor]];
    self.backV.layer.cornerRadius = 5;
    self.blueLV.layer.cornerRadius = 5;
    self.blueV.layer.cornerRadius = 5;
    [_tableView setHidden:YES];
    UDPManage *mg = [[UDPManage alloc]init];
    [mg startListenClientSocketMessage];
}
- (IBAction)connectDeviceAction:(id)sender {
//    SLWebViewController *webVC = [[SLWebViewController alloc]init];
//    [self presentViewController:webVC animated:YES completion:nil];
    WebViewVC *webVC = [[WebViewVC alloc]init];
    [self presentViewController:webVC animated:YES completion:nil];
//
//    WebViewController *webVC = [[WebViewController alloc]init];
//    [self presentViewController:webVC animated:YES completion:nil];
}
- (IBAction)clickePopListAction:(id)sender {
    [_tableView setHidden:!_tableView.hidden];
}

- (IBAction)refrushAction:(id)sender {
    
}

#pragma mark - TableViewDelegate
-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 1;
}
-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 10;
}
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    PopListCell * cell = [tableView dequeueReusableCellWithIdentifier:@"PopListCell"];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    return cell;
}
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    PopListCell * cell = [tableView dequeueReusableCellWithIdentifier:@"PopListCell" forIndexPath:indexPath];
    _deviceIPLabel.text =cell.deviceIPLabel.text;
    [_tableView setHidden:!_tableView.hidden];

}
@end
