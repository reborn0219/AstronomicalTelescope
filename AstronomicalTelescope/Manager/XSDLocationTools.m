//
//  XSDLocationTools.m
//  物联宝管家
//
//  Created by yang on 2019/1/18.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import "XSDLocationTools.h"
#import <CoreLocation/CoreLocation.h>
#define LAST_LONG  @"last_longitude"  // 上次上传位置的经度
#define LAST_LATI  @"last_latitude"  // 上次上传位置的纬度


@interface XSDLocationTools ()<CLLocationManagerDelegate>
{
    //dispatch_source_t _timer;
    CLLocationCoordinate2D _newCoor;
}
// 1.设置位置管理者属性
@property (nonatomic, strong) CLLocationManager *lcManager;
//@property (nonatomic, assign) BOOL isRequest;
@property (nonatomic, strong) NSTimer *uploadTimer;

@end

@implementation XSDLocationTools

+ (XSDLocationTools *)shareInstance {
    static XSDLocationTools *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[XSDLocationTools alloc] init];
    });

    return instance;
}
-(void)stopLocationService{
    [self.lcManager stopUpdatingLocation];
    [self.uploadTimer setFireDate:[NSDate distantFuture]];
}
// 开启定位
- (void)startLocationService {
    if ([CLLocationManager locationServicesEnabled]) {
        // 创建位置管理者对象
        self.lcManager = [[CLLocationManager alloc] init];
        self.lcManager.delegate = self; // 设置代理
        // 设置定位距离过滤参数 (当本次定位和上次定位之间的距离大于或等于这个值时，调用代理方法)
        self.lcManager.distanceFilter = 5;
        self.lcManager.desiredAccuracy = kCLLocationAccuracyBest; // 设置定位精度(精度越高越耗电)

        // 2、在Info.plist文件中添加如下配置：
        //（1）NSLocationAlwaysUsageDescription 授权使应用在前台后台都能使用定位服务
        //（2）NSLocationWhenInUseUsageDescription 授权使应用只能在前台使用定位服务
        // 两者也可以都写
        
        if ([[UIDevice currentDevice].systemVersion floatValue] >=8.0 ) {
            // iOS0.0：如果当前的授权状态是使用是授权，那么App退到后台后，将不能获取用户位置，即使勾选后台模式：location
//            [self.lcManager requestAlwaysAuthorization];
            [self.lcManager requestWhenInUseAuthorization];
        }

        // iOS9.0+ 要想继续获取位置，需要使用以下属性进行设置（注意勾选后台模式：location）但会出现蓝条
//        if ([self.lcManager respondsToSelector:@selector(allowsBackgroundLocationUpdates)]) {
//            //
//            self.lcManager.allowsBackgroundLocationUpdates = YES;
//        }

        [self.lcManager startUpdatingLocation]; // 开始更新位置
    }
}


/** 获取到新的位置信息时调用*/
-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    CLLocation *tempLocation = locations[0];
    NSLog(@"%@",tempLocation);
    NSString * lat = [NSString stringWithFormat:@"%f",tempLocation.coordinate.latitude];
    NSString * lng = [NSString stringWithFormat:@"%f",tempLocation.coordinate.longitude];
    [[NSUserDefaults standardUserDefaults]setObject:lat forKey:@"latitude"];
    [[NSUserDefaults standardUserDefaults]setObject:lng forKey:@"longitude"];
    [[NSUserDefaults standardUserDefaults]synchronize];
}
/** 不能获取位置信息时调用*/
-(void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    NSLog(@"获取定位失败");
}

/** 定位服务状态改变时调用*/
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
        {
            NSLog(@"用户还未决定授权");
            break;
        }
        case kCLAuthorizationStatusRestricted:
        {
            NSLog(@"访问受限");
            break;
        }
        case kCLAuthorizationStatusDenied:
        {
            // 类方法，判断是否开启定位服务
            if ([CLLocationManager locationServicesEnabled]) {
                NSLog(@"定位服务开启，被拒绝");
            } else {
                NSLog(@"定位服务关闭，不可用");
            }
            break;
        }
        case kCLAuthorizationStatusAuthorizedAlways:
        {
            NSLog(@"获得前后台授权");
            break;
        }
        case kCLAuthorizationStatusAuthorizedWhenInUse:
        {
            NSLog(@"获得前台授权");
            break;
        }
        default:
            break;
    }
}


// 直接上传用户位置
static NSInteger uploadCount = 1;
- (void)uploadUserLocationHandle:(CLLocationCoordinate2D)coor {

    NSDictionary *dic = @{@"longitude":@(coor.longitude),
                          @"latitude":@(coor.latitude)};
    __weak typeof(self)weakSelf = self;
   ///上传接口

}


// 懒加载
- (NSTimer *)uploadTimer {
    if (!_uploadTimer) {
        _uploadTimer = [NSTimer scheduledTimerWithTimeInterval:4.0 target:self selector:@selector(uploadLocationTimer) userInfo:nil repeats:YES];
    }
    return _uploadTimer;
}

@end

