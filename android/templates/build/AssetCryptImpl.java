package <%- appid %>;

import java.util.Collections;
import java.util.Map;
import java.util.HashMap;
import java.nio.CharBuffer;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.lang.reflect.Method;
import org.appcelerator.kroll.util.KrollAssetHelper;
import org.appcelerator.kroll.common.Log;

public class AssetCryptImpl implements KrollAssetHelper.AssetCrypt
{
	private static class Range {
		int offset;
		int length;
		public Range(int offset, int length) {
			this.offset = offset;
			this.length = length;
		}
	}

	<%- encryptedAssets %>

	public String readAsset(String path)
	{
		Range range = assets.get(path);
		if (range == null) {
			return null;
		}
		return new String(filterDataInRange(assetsBytes, range.offset, range.length));
	}

	private static byte[] filterDataInRange(byte[] data, int offset, int length)
	{
		try {
			Class clazz = Class.forName("org.appcelerator.titanium.TiVerify");
			Method method = clazz.getMethod("filterDataInRange", new Class[] {data.getClass(), int.class, int.class});
			return (byte[])method.invoke(clazz, new Object[] { data, offset, length });
		} catch (Exception e) {
			Log.e("AssetCryptImpl", "Unable to load asset data.", e);
		}
		return new byte[0];
	}
}
