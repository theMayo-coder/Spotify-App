import 'dart:async';
import 'dart:html' as html;
import 'dart:js' as js;
import 'dart:ui_web' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class WebcamMoodWidget extends StatefulWidget {
  const WebcamMoodWidget({super.key});

  @override
  State<WebcamMoodWidget> createState() => _WebcamMoodWidgetState();
}

class _WebcamMoodWidgetState extends State<WebcamMoodWidget> {
  static bool _factoryRegistered = false;

  Timer? _pollTimer;

  String _mood = "unknown";
  double _confidence = 0.0;
  String _debug = "";

  @override
  void initState() {
    super.initState();

    if (!kIsWeb) return;

    _registerViewFactoryOnce();

    // Wait until the HtmlElementView is mounted (so the <video> exists),
    // then start webcam + mediapipe.
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _startWebcamWithRetry();
    });

    // Poll the values that mood.js writes to window.
    _pollTimer = Timer.periodic(const Duration(milliseconds: 250), (_) {
      final mood = js.context['currentMood']?.toString() ?? "unknown";
      final conf = (js.context['currentConfidence'] as num?)?.toDouble() ?? 0.0;
      final dbg = js.context['currentMoodDebug']?.toString() ?? "";

      if (mood != _mood || conf != _confidence || dbg != _debug) {
        setState(() {
          _mood = mood;
          _confidence = conf;
          _debug = dbg;
        });
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  void _registerViewFactoryOnce() {
    if (_factoryRegistered) return;

    ui.platformViewRegistry.registerViewFactory(
      'webcamVideoView',
      (int viewId) {
        final v = html.VideoElement()
          ..id = "webcamVideo"
          ..autoplay = true
          ..muted = true
          ..style.width = "100%"
          ..style.height = "100%"
          ..style.objectFit = "cover";
        return v;
      },
    );

    _factoryRegistered = true;
  }

  Future<void> _startWebcamWithRetry() async {
    // Retry because sometimes the DOM isn't ready instantly.
    for (int i = 0; i < 20; i++) {
      final videoEl = html.document.getElementById("webcamVideo");
      if (videoEl != null) {
        // mood.js must define window.startWebcam
        try {
          js.context.callMethod('startWebcam');
        } catch (e) {
          setState(() {
            _debug = "JS startWebcam not found or failed: $e";
          });
        }
        return;
      }
      await Future.delayed(const Duration(milliseconds: 150));
    }

    setState(() {
      _debug = "Video element not found. HtmlElementView may not be mounted.";
    });
  }

  Color _bgForMood(String mood) {
    switch (mood) {
      case "happy":
        return Colors.yellow.shade200;
      case "calm":
        return Colors.blue.shade200;
      case "focused":
        return Colors.purple.shade200;
      case "tired":
        return Colors.grey.shade300;
      case "neutral":
        return Colors.green.shade200;
      default:
        return Colors.black12;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
      color: _bgForMood(_mood),
      child: Column(
        children: [
          Expanded(
            child: Container(
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.black12,
              ),
              child: const HtmlElementView(viewType: 'webcamVideoView'),
            ),
          ),
          const SizedBox(height: 12),
          _InfoCard(
            mood: _mood,
            confidence: _confidence,
            debug: _debug,
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String mood;
  final double confidence;
  final String debug;

  const _InfoCard({
    required this.mood,
    required this.confidence,
    required this.debug,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.55),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.white),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Mood: ${mood.toUpperCase()}",
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text("Confidence: ${(confidence * 100).toStringAsFixed(0)}%"),
            if (debug.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                debug,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
