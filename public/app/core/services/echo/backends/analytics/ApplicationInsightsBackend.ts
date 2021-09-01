import $ from 'jquery';
import { EchoBackend, EchoEventType, isInteractionEvent, isPageviewEvent, PageviewEchoEvent } from '@grafana/runtime';

export interface ApplicationInsightsBackendOptions {
  connectionString: string;
}

export class ApplicationInsightsBackend implements EchoBackend<PageviewEchoEvent, ApplicationInsightsBackendOptions> {
  supportedEvents = [EchoEventType.Pageview];

  constructor(public options: ApplicationInsightsBackendOptions) {
    $.ajax({
      url: 'https://js.monitor.azure.com/scripts/b/ai.2.min.js',
      dataType: 'script',
      cache: true,
    }).done(function () {
      var applicationInsightsOpts = {
        config: {
          connectionString: options.connectionString,
        },
      };
      var init = new (window as any).Microsoft.ApplicationInsights.ApplicationInsights(applicationInsightsOpts);
      (window as any).applicationInsights = init.loadAppInsights();
    });
  }

  addEvent = (e: PageviewEchoEvent) => {
    if (!(window as any).applicationInsights) {
      return;
    }

    if (isPageviewEvent(e)) {
      (window as any).applicationInsights.trackPageView();
    }

    if (isInteractionEvent(e)) {
      (window as any).applicationInsights.trackPageView({
        name: e.payload.interactionName,
        properties: e.payload.properties,
      });
    }
  };

  // Not using Echo buffering, addEvent above sends events to Application Insights as soon as they appear
  flush = () => {};
}
