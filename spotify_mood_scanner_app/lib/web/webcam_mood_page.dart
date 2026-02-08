import 'package:flutter/material.dart';
import 'webcam_mood_widget.dart';

class WebcamMoodPage extends StatelessWidget {
  const WebcamMoodPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Web Mood Scanner (Webcam)")),
      body: Padding(
        padding: EdgeInsets.all(12),
        child: WebcamMoodWidget(),
      ),
    );
  }
}
