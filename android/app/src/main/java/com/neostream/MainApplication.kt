package com.neostream

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.ReactCookieJarContainer
import okhttp3.OkHttpClient
import okhttp3.JavaNetCookieJar
import java.net.CookieManager
import java.net.CookiePolicy
import java.util.concurrent.TimeUnit

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(URLResolverPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    
    // Configure OkHttpClient to follow redirects for IPTV streams
    OkHttpClientProvider.setOkHttpClientFactory(object : OkHttpClientFactory {
      override fun createNewNetworkModuleClient(): OkHttpClient {
        val cookieManager = CookieManager()
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL)
        
        return OkHttpClient.Builder()
          .connectTimeout(30, TimeUnit.SECONDS)
          .readTimeout(30, TimeUnit.SECONDS)
          .writeTimeout(30, TimeUnit.SECONDS)
          .followRedirects(true)  // Enable redirect following
          .followSslRedirects(true)  // Enable SSL redirect following
          .cookieJar(ReactCookieJarContainer())
          .build()
      }
    })
    
    loadReactNative(this)
  }
}
