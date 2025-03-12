import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { generateUniqueId } from 'src/helpers/utils.helper';
import { SubscriptionTypes } from 'src/constants/subscription.constant';
import { SubscriptionPlan } from 'src/api/subscription/entities/subscription-plan.entity';

export default class CreateSubscriptionPlans implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: false
   */
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    await dataSource.query(`SET FOREIGN_KEY_CHECKS=0;`);
    await dataSource.query(`TRUNCATE subscription_plans;`);
    await dataSource.query(`SET FOREIGN_KEY_CHECKS=1;`);

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(SubscriptionPlan)
      .values([
        {
          uniqueId: generateUniqueId('SP'),
          type: SubscriptionTypes.MONTHLY,
          title: 'Monthly plan',
          originalPrice: '20',
          discount: null,
          price: '20',
          productId: '',
          features:
            'Customized workout plan with detail sets and reps details,Customized workout plan with detail sets,Quis viverra a at donec,Congue viverra ridiculus interdum tellus,Customized workout plan with detail sets',
        },
        {
          uniqueId: await generateUniqueId('SP'),
          type: SubscriptionTypes.ANNUALLY,
          title: 'Annual plan',
          originalPrice: '240',
          discount: '15',
          price: '200',
          productId: '',
          features:
            'Customized workout plan with detail sets and reps details,Customized workout plan with detail sets,Quis viverra a at donec,Congue viverra ridiculus interdum tellus,Customized workout plan with detail sets',
        },
      ])
      .execute();

    console.log('Seeding completed for TABLE: subscription_plans');
  }
}
