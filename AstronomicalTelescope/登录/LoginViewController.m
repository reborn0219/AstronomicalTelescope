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
#import "XSDLocationTools.h"
@interface LoginViewController ()<UITableViewDelegate,UITableViewDataSource,UDPServerSocketDelegate>
@property (weak, nonatomic) IBOutlet UIView *backV;
@property (weak, nonatomic) IBOutlet UIView *blueLV;
@property (weak, nonatomic) IBOutlet UIView *blueV;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *tableView_H;
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UILabel *deviceIPLabel;
@property (strong, nonatomic)NSMutableArray *ipListArr;
@property (strong, nonatomic)NSMutableArray *ipNameArr;
@property (strong, nonatomic)UDPManage *UDPmg;
@property (nonatomic, copy)NSString *currentIP;

@end

@implementation LoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _ipListArr = [NSMutableArray array];
    _ipNameArr = [NSMutableArray array];
    self.deviceIPLabel.text = @"";

    _tableView.delegate = self;
    _tableView.dataSource = self;
    [_tableView registerNib:[UINib nibWithNibName:@"PopListCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"PopListCell"];
    _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    _tableView.estimatedRowHeight=44;
    _tableView.rowHeight=UITableViewAutomaticDimension;
    [_tableView setBackgroundColor:HexRGB(0x312F31)];

    [self.view setBackgroundColor:[UIColor blackColor]];
    self.backV.layer.cornerRadius = 5;
    self.blueLV.layer.cornerRadius = 5;
    self.blueV.layer.cornerRadius = 5;
    [_tableView setHidden:YES];
    _UDPmg = [[UDPManage alloc]init];
    _UDPmg.delegate = self;
    [_UDPmg startListenClientSocketMessage];
    [[XSDLocationTools shareInstance]startLocationService];
    
}
-(void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];

}
-(void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
}

- (IBAction)connectDeviceAction:(id)sender {
    [_UDPmg stopListen];
    SLWebViewController *webVC = [[SLWebViewController alloc]init];
    webVC.ipName = self.currentIP;

    [self presentViewController:webVC animated:YES completion:nil];
//    WebViewVC *webVC = [[WebViewVC alloc]init];
//    webVC.ipName = self.currentIP;
//    [self presentViewController:webVC animated:YES completion:nil];
//
//    WebViewController *webVC = [[WebViewController alloc]init];
//    [self presentViewController:webVC animated:YES completion:nil];
}
- (IBAction)clickePopListAction:(id)sender {
    [_tableView setHidden:!_tableView.hidden];
    
    if (_tableView.hidden) {
        [_UDPmg startListenClientSocketMessage];
    }
}

- (IBAction)refrushAction:(id)sender {
    
}

#pragma mark - TableViewDelegate
-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 1;
}
-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return _ipNameArr.count;
}
-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    NSString * ipname = [_ipNameArr objectAtIndex:indexPath.row];
    PopListCell * cell = [tableView dequeueReusableCellWithIdentifier:@"PopListCell"];
    cell.deviceIPLabel.text = ipname;
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    return cell;
}
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSString * ipname = [_ipNameArr objectAtIndex:indexPath.row];
    NSString * current = [_ipListArr objectAtIndex:indexPath.row];

    _deviceIPLabel.text =ipname;
    self.currentIP = current;
    [_tableView setHidden:!_tableView.hidden];

}
-(void)serverSocketDidReceiveMessage:(NSString *)message{
    NSLog(@"UDP---消息：%@",message);
    MJWeakSelf
    dispatch_async(dispatch_get_main_queue(), ^{

    NSArray  *array = [message componentsSeparatedByString:@"|"];
    if (array.count>1) {
        NSString * name = [array firstObject];
        NSString * ipname = array[1];

        if (![weakSelf.ipNameArr containsObject:name]) {
            [weakSelf.ipNameArr addObject:name];
        }
        if (![weakSelf.ipListArr containsObject:ipname]) {
            [weakSelf.ipListArr addObject:ipname];
        }
    }
    if (weakSelf.deviceIPLabel.text.length==0) {
        if (weakSelf.ipNameArr.count) {
            weakSelf.deviceIPLabel.text = weakSelf.ipNameArr.firstObject;
            weakSelf.currentIP=weakSelf.ipListArr.firstObject;
        }else{
            weakSelf.deviceIPLabel.text = @"";

        }

    }
    [weakSelf.tableView reloadData];
    weakSelf.tableView_H.constant = weakSelf.ipNameArr.count*40;
    });
}
@end
