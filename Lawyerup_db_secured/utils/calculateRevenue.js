const PRICING = {
    basic: {
      daily: 10,
      weekly: 50,
      monthly: 150
    },
    premium: {
      daily: 20,
      weekly: 100,
      monthly: 300
    }
  };
  
  const calculateRevenue = ({ basic = {}, premium = {} }) => {
    const calc = (plan, rates) => {
      return (
        (plan.daily || 0) * rates.daily +
        (plan.weekly || 0) * rates.weekly +
        (plan.monthly || 0) * rates.monthly
      );
    };
  
    return {
      basic: calc(basic, PRICING.basic),
      premium: calc(premium, PRICING.premium)
    };
  };
  
  export default calculateRevenue;
  