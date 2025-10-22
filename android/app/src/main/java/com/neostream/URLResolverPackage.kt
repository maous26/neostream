package com.neostream

import android.util.Log
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class URLResolverPackage : ReactPackage {
    init {
        Log.d("URLResolver", "URLResolverPackage created!")
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        Log.d("URLResolver", "Creating URLResolverModule...")
        return listOf(URLResolverModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
