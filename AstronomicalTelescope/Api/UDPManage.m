//
//  UDPManage.m
//  AstronomicalTelescope
//
//  Created by apple on 2019/6/1.
//  Copyright © 2019 yang. All rights reserved.
//

#import "UDPManage.h"

#import "GCDAsyncUdpSocket.h"

#define udpPort 59999

@interface UDPManage () <GCDAsyncUdpSocketDelegate>
{
    GCDAsyncUdpSocket * udpSocket;
}
@end

static UDPManage *myUDPManage = nil;

@implementation UDPManage
-(void)stopListen{
    [udpSocket close];
}
- (void)startListenClientSocketMessage{
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    udpSocket = [[GCDAsyncUdpSocket alloc]initWithDelegate:self delegateQueue:queue];
    self.udpSocket = udpSocket;
    self.isSending = NO;
    // 关联端口,监听端口
    NSError * error;
    [udpSocket enableBroadcast:YES error:&error];

    [udpSocket bindToPort:udpPort error:&error];
    // 接受一次消息（启动一个等待接受，且只接收一次）
    [udpSocket receiveOnce:nil];
//    [udpSocket receiveWithTimeout:-1 tag:0];
    if (error) {//监听错误打印错误信息
        NSLog(@"error:%@",error);
    }else {//监听成功则开始接收信息
        [self.udpSocket beginReceiving:&error];
    }
    
    if (![udpSocket bindToPort:udpPort error:&error])
    {
        NSLog(@"Error starting server (bind): %@", error);
        return;
    }
    if (![udpSocket beginReceiving:&error])
    {
        [udpSocket close];
        
        NSLog(@"Error starting server (recv): %@", error);
        return;
    }

}

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didConnectToAddress:(NSData *)address{
    NSString * ip = [GCDAsyncUdpSocket hostFromAddress:address];
    uint16_t port = [GCDAsyncUdpSocket portFromAddress:address];
    self.clientIP = ip;
    self.clientPort = port;
    NSLog(@"sock: %@  didConnectToAddress：ip:%@  port:%d",sock,ip,port);
}

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didReceiveData:(NSData *)data fromAddress:(NSData *)address withFilterContext:(id)filterContext{
    NSString * ip = [GCDAsyncUdpSocket hostFromAddress:address];
    uint16_t port = [GCDAsyncUdpSocket portFromAddress:address];
    
    self.clientIP = ip;
    self.clientPort = port;
    
    NSString * messgae = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    
    NSLog(@"sock: %@  接收到消息：ip:%@  port:%d  message:%@",sock,ip,port,messgae);
    if ([self.delegate respondsToSelector:@selector(serverSocketDidReceiveMessage:)]) {
        [self.delegate serverSocketDidReceiveMessage:messgae];
    }
    [self sendBackToHost:ip port:port message:@"***************************************************"];
    
    self.times ++;
    //    NSLog(@"times:%ld",self.times);
    
    
    // 再次启动接收等待
    [self.udpSocket receiveOnce:nil];
}

- (void)sendMessage:(NSString *)message{
    [self.messageQueue addObject:message];
    if (!self.isSending) {
        [self sendBackToHost:self.clientIP port:self.clientPort message:message];
    }
}

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didNotSendDataWithTag:(long)tag dueToError:(NSError *)error{
    NSLog(@"sock: %@  服务端发送失败 %@",sock,[error description]);
    self.resendTimes ++;
    if (self.resendTimes == 4) {
        [self.messageQueue removeObject:self.currentSendingMessage];
        self.currentSendingMessage = nil;
        self.isSending = NO;
    }else{
        [self sendBackToHost:self.clientIP port:self.clientPort message:self.currentSendingMessage];
    }
}

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didSendDataWithTag:(long)tag{
    NSLog(@"sock: %@  服务端发送成功!   message:%@",sock,self.currentSendingMessage);
    [self.messageQueue removeObject:self.currentSendingMessage];
    self.isSending = NO;
    self.currentSendingMessage = nil;
}

- (void)udpSocketDidClose:(GCDAsyncUdpSocket *)sock withError:(NSError *)error{
    NSLog(@"sock: %@  断开连接  %@",sock,[error description]);
}

- (void)sendBackToHost:(NSString *)ip port:(uint16_t)port message:(NSString *)message{
    self.currentSendingMessage = message;
    self.isSending = YES;
    NSData * data = [message dataUsingEncoding:NSUTF8StringEncoding];
    [self.udpSocket sendData:data toHost:ip port:port withTimeout:-1 tag:0];
}

- (void)setIsSending:(BOOL)isSending{
    _isSending = isSending;
    if (!isSending && self.messageQueue.count) {
        [self sendBackToHost:self.clientIP port:self.clientPort message:[self.messageQueue firstObject]];
    }
}

- (NSMutableArray *)messageQueue{
    if (!_messageQueue) {
        _messageQueue = [[NSMutableArray alloc]init];
    }return _messageQueue;
}
//+(instancetype)shareUDPManage{
//    static dispatch_once_t onceToken;
//    dispatch_once(&onceToken, ^{
//        myUDPManage = [[UDPManage alloc]init];
//        [myUDPManage createClientUdpSocket];
//    });
//    return myUDPManage;
//}


//-(void)createClientUdpSocket{
//    //创建udp socket
//    self.udpSocket = [[GCDAsyncUdpSocket alloc] initWithDelegate:self delegateQueue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)];
//
//    //banding一个端口(可选),如果不绑定端口,那么就会随机产生一个随机的电脑唯一的端口
//    NSError * error = nil;
//    [self.udpSocket bindToPort:udpPort error:&error];
//
//    //启用广播
//    [self.udpSocket enableBroadcast:YES error:&error];
//
//    if (error) {//监听错误打印错误信息
//        NSLog(@"error:%@",error);
//    }else {//监听成功则开始接收信息
//        [self.udpSocket beginReceiving:&error];
//    }
//}
//
////广播
//-(void)broadcast{
//
//    NSString *str = @"大圣遛码";
//    NSData *data = [str dataUsingEncoding:NSUTF8StringEncoding];
//
//    //此处如果写成固定的IP就是对特定的server监测
//    NSString *host = @"255.255.255.255";
//
//    //发送数据（tag: 消息标记）
//    [self.udpSocket sendData:data toHost:host port:udpPort withTimeout:-1 tag:100];
//
//}
//#pragma mark GCDAsyncUdpSocketDelegate
////发送数据成功
//-(void)udpSocket:(GCDAsyncUdpSocket *)sock didSendDataWithTag:(long)tag{
//    if (tag == 100) {
//        NSLog(@"标记为100的数据发送完成了");
//    }
//}
//
////发送数据失败
//-(void)udpSocket:(GCDAsyncUdpSocket *)sock didNotSendDataWithTag:(long)tag dueToError:(NSError *)error{
//    NSLog(@"标记为%ld的数据发送失败，失败原因：%@",tag, error);
//}
//
////接收到数据
//-(void)udpSocket:(GCDAsyncUdpSocket *)sock didReceiveData:(NSData *)data fromAddress:(NSData *)address withFilterContext:(id)filterContext{
//
//    NSString *ip = [GCDAsyncUdpSocket hostFromAddress:address];
//    uint16_t port = [GCDAsyncUdpSocket portFromAddress:address];
//    NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
//    NSLog(@"收到服务端的响应 [%@:%d] %@", ip, port, str);
//}

@end
