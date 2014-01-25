//
//  TiUIScrollableView+SMExt.m
//  Titanium
//
//  Created by Andrey Verbin on 28.05.13.
//
//

#import "TiUIScrollableView+SMExt.h"

@implementation TiUIScrollableView (SMExt)

-(void)setDelaysContentTouches_:(id)args
{
	BOOL delaysContentTouches = [TiUtils boolValue:args];
    self.scrollview.delaysContentTouches = delaysContentTouches;	
}

-(void)setPageIndicatorTintColor_:(id)args
{
    TiColor* val = [TiUtils colorValue:args];
    if (val != nil) {
        if (showPageControl && (scrollview!=nil) && ([[scrollview subviews] count]>0)) {
            [[self pagecontrol] setPageIndicatorTintColor:[val _color]];
        }
    }
}

-(void)setPagingControlColor_:(id)args
{
    TiColor* val = [TiUtils colorValue:args];
    if (val != nil) {
        if (showPageControl && (scrollview!=nil) && ([[scrollview subviews] count]>0)) {
            [[self pagecontrol] setCurrentPageIndicatorTintColor:[val _color]];
        }
    }
}

@end
