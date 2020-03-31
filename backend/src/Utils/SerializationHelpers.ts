import {logError} from "backend/src/Utils/Logging";

export function parseJsonList<T>(input: string, factoryFn: (item: any) => T | undefined): T[] {
  let items;

  try {
    items = JSON.parse(input);

    if (Array.isArray(items)) {
      const validItems: T[] = [];
      const badItems: any[] = [];

      items.forEach(item => {
        let value: T | undefined;

        try {
          value = factoryFn(item);
        } catch (error) {
          logError("parseJsonList", "factoryFn", item);
        }

        if (value === undefined) {
          badItems.push(item);
        } else {
          validItems.push(value);
        }
      });

      if (badItems.length > 0) {
        logError("parseJsonList", "badItems", badItems);
      }

      return validItems;
    } else {
      logError("parseJsonList", "Bad items type", typeof items);
      return [];
    }
  } catch (e) {
    logError("parseJsonList", "JSON.parse", e);
    return [];
  }
}
