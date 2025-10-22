package com.neostream

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

class URLResolverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        Log.d("URLResolver", "URLResolverModule created!")
    }

    override fun getName(): String {
        return "URLResolver"
    }

    @ReactMethod
    fun resolveUrl(url: String, headersMap: ReadableMap?, promise: Promise) {
        Log.d("URLResolver", "resolveUrl called with URL: $url")
        Thread {
            try {
                // Create OkHttpClient with redirect following disabled
                // so we can manually capture the Location header
                val client = OkHttpClient.Builder()
                    .followRedirects(false)
                    .followSslRedirects(false)
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(10, TimeUnit.SECONDS)
                    .build()

                // Build request with headers
                val requestBuilder = Request.Builder().url(url)
                
                // Add headers from JavaScript
                if (headersMap != null) {
                    val iterator = headersMap.keySetIterator()
                    while (iterator.hasNextKey()) {
                        val key = iterator.nextKey()
                        val value = headersMap.getString(key)
                        if (value != null) {
                            requestBuilder.addHeader(key, value)
                        }
                    }
                }

                val request = requestBuilder.build()
                
                // Execute request
                val response = client.newCall(request).execute()
                
                try {
                    // Check for redirect (301, 302, 303, 307, 308)
                    val statusCode = response.code
                    if (statusCode in 301..308) {
                        // Get the Location header
                        val location = response.header("Location")
                        if (location != null) {
                            // Resolve relative URLs
                            val resolvedUrl = if (location.startsWith("http")) {
                                location
                            } else {
                                val originalUrl = java.net.URL(url)
                                java.net.URL(originalUrl, location).toString()
                            }
                            
                            promise.resolve(resolvedUrl)
                        } else {
                            // No Location header, return original URL
                            promise.resolve(url)
                        }
                    } else if (statusCode == 200) {
                        // No redirect, return original URL
                        promise.resolve(url)
                    } else {
                        // Other status codes, return original URL
                        promise.resolve(url)
                    }
                } finally {
                    response.close()
                }
            } catch (e: IOException) {
                // Network error, return original URL as fallback
                promise.resolve(url)
            } catch (e: Exception) {
                // Any other error, reject the promise
                promise.reject("URL_RESOLVE_ERROR", e.message, e)
            }
        }.start()
    }
}
