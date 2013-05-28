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

@end
